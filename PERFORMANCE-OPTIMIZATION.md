# Agrinext Phase 2 - Performance Optimization Guide

## Overview

This document outlines performance optimization strategies and benchmarks for the Agrinext MVP Phase 2 implementation.

---

## Performance Requirements

### API Response Times
- **Disease Detection**: < 30 seconds (including AI inference)
- **Advisory Query**: < 5 seconds (including OpenAI response)
- **Authentication**: < 2 seconds
- **Profile Operations**: < 1 second
- **Government Schemes**: < 1 second (with caching)
- **History Queries**: < 2 seconds

### Concurrent Users
- **Target**: 100 concurrent users
- **Database Connections**: 10-50 connections (pooled)
- **Rate Limiting**: 100 requests/minute per user

### Mobile App Performance
- **App Launch**: < 3 seconds
- **Screen Navigation**: < 500ms
- **Image Loading**: < 2 seconds
- **Offline Data Access**: < 500ms

---

## Backend Optimizations

### 1. Database Query Optimization

#### Indexes
Add indexes to frequently queried columns:

```sql
-- User lookups
CREATE INDEX idx_users_mobile_number ON users(mobile_number);
CREATE INDEX idx_users_id ON users(id);

-- Detection history queries
CREATE INDEX idx_detections_user_timestamp ON disease_detections(user_id, detected_at DESC);
CREATE INDEX idx_detections_id ON disease_detections(id);

-- Advisory history queries
CREATE INDEX idx_advisories_user_timestamp ON advisories(user_id, created_at DESC);
CREATE INDEX idx_advisories_id ON advisories(id);

-- Session lookups
CREATE INDEX idx_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_sessions_refresh_token ON user_sessions(refresh_token_hash);

-- Rate limiting
CREATE INDEX idx_rate_limits_identifier ON rate_limits(identifier, window_start);

-- Audit logs (for reporting)
CREATE INDEX idx_audit_user_timestamp ON audit_logs(user_id, timestamp DESC);
CREATE INDEX idx_audit_action ON audit_logs(action);
```

#### Query Optimization
```typescript
// Use pagination for all list queries
const PAGINATION_LIMIT = 20;

// Use SELECT specific columns instead of SELECT *
const query = `
  SELECT id, disease_name, severity, confidence_score, detected_at
  FROM disease_detections
  WHERE user_id = $1
  ORDER BY detected_at DESC
  LIMIT $2 OFFSET $3
`;

// Use prepared statements for repeated queries
const preparedQuery = await pool.prepare(query);
```

### 2. Caching Strategy

#### Government Schemes Cache
```typescript
// Cache schemes for 24 hours
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

let schemesCache: {
  data: GovernmentScheme[];
  timestamp: number;
} | null = null;

export async function getAllSchemes(): Promise<GovernmentScheme[]> {
  const now = Date.now();
  
  // Return cached data if valid
  if (schemesCache && (now - schemesCache.timestamp) < CACHE_TTL) {
    return schemesCache.data;
  }
  
  // Fetch fresh data
  const schemes = await fetchSchemesFromDatabase();
  
  // Update cache
  schemesCache = {
    data: schemes,
    timestamp: now,
  };
  
  return schemes;
}
```

#### Redis Caching (Optional Enhancement)
```typescript
// For production, consider Redis for distributed caching
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Cache OTP codes
await redis.setex(`otp:${mobileNumber}`, 600, otpCode); // 10 min TTL

// Cache user sessions
await redis.setex(`session:${userId}`, 3600, JSON.stringify(session)); // 1 hour TTL

// Cache schemes
await redis.setex('schemes:all', 86400, JSON.stringify(schemes)); // 24 hours TTL
```

### 3. Connection Pooling

#### Database Pool Configuration
```typescript
// backend/src/config/database.ts
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  
  // Connection pool settings
  min: 10,                    // Minimum connections
  max: 50,                    // Maximum connections
  idleTimeoutMillis: 30000,   // Close idle connections after 30s
  connectionTimeoutMillis: 2000, // Timeout for acquiring connection
});
```

### 4. Image Optimization

#### S3 Upload Optimization
```typescript
// Compress images before upload
import ImageResizer from 'react-native-image-resizer';

const compressImage = async (imageUri: string): Promise<string> => {
  const compressed = await ImageResizer.createResizedImage(
    imageUri,
    1920,        // Max width
    1920,        // Max height
    'JPEG',      // Format
    80,          // Quality (0-100)
    0,           // Rotation
    undefined,   // Output path
    false,       // Keep metadata
    { mode: 'contain' }
  );
  
  return compressed.uri;
};

// Use multipart upload for large files
const uploadLargeImage = async (file: Buffer): Promise<string> => {
  const upload = new AWS.S3.ManagedUpload({
    params: {
      Bucket: process.env.S3_BUCKET,
      Key: generateKey(),
      Body: file,
      ContentType: 'image/jpeg',
    },
    partSize: 5 * 1024 * 1024, // 5MB parts
    queueSize: 4,               // 4 concurrent uploads
  });
  
  const result = await upload.promise();
  return result.Location;
};
```

### 5. API Response Optimization

#### Compression
```typescript
// Enable gzip compression
import compression from 'compression';

app.use(compression({
  level: 6,                    // Compression level (0-9)
  threshold: 1024,             // Only compress responses > 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
}));
```

#### Response Pagination
```typescript
// Standardized pagination response
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Helper function
function paginateResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): PaginatedResponse<T> {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
```

---

## Mobile App Optimizations

### 1. Image Loading Optimization

#### Lazy Loading
```typescript
// Use React Native Fast Image for better performance
import FastImage from 'react-native-fast-image';

<FastImage
  style={styles.image}
  source={{
    uri: imageUrl,
    priority: FastImage.priority.normal,
    cache: FastImage.cacheControl.immutable,
  }}
  resizeMode={FastImage.resizeMode.contain}
/>
```

#### Image Caching
```typescript
// Preload images for better UX
FastImage.preload([
  { uri: image1Url },
  { uri: image2Url },
  { uri: image3Url },
]);

// Clear cache when needed
FastImage.clearMemoryCache();
FastImage.clearDiskCache();
```

### 2. List Rendering Optimization

#### FlatList Optimization
```typescript
<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={(item) => item.id}
  
  // Performance optimizations
  initialNumToRender={10}           // Render 10 items initially
  maxToRenderPerBatch={10}          // Render 10 items per batch
  windowSize={5}                    // Keep 5 screens worth of items
  removeClippedSubviews={true}      // Unmount off-screen items
  updateCellsBatchingPeriod={50}    // Batch updates every 50ms
  
  // Memoize render function
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>
```

#### Memoization
```typescript
// Memoize expensive components
const MemoizedItem = React.memo(({ item }) => {
  return <ItemComponent item={item} />;
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.item.id === nextProps.item.id;
});

// Use useMemo for expensive calculations
const sortedItems = useMemo(() => {
  return items.sort((a, b) => b.timestamp - a.timestamp);
}, [items]);

// Use useCallback for event handlers
const handlePress = useCallback((id: string) => {
  navigation.navigate('Detail', { id });
}, [navigation]);
```

### 3. State Management Optimization

#### Avoid Unnecessary Re-renders
```typescript
// Use React.memo for pure components
export default React.memo(MyComponent);

// Split context to avoid unnecessary re-renders
// Bad: Single large context
const AppContext = createContext({ user, settings, theme, ... });

// Good: Multiple focused contexts
const UserContext = createContext(user);
const SettingsContext = createContext(settings);
const ThemeContext = createContext(theme);
```

### 4. Network Request Optimization

#### Request Batching
```typescript
// Batch multiple requests
const [detections, advisories, schemes] = await Promise.all([
  getDetectionHistory({ page: 1, limit: 20 }),
  getAdvisoryHistory({ page: 1, limit: 20 }),
  getSchemes(),
]);
```

#### Request Cancellation
```typescript
// Cancel requests when component unmounts
useEffect(() => {
  const controller = new AbortController();
  
  fetchData(controller.signal);
  
  return () => {
    controller.abort();
  };
}, []);
```

### 5. Database Optimization (SQLite)

#### Batch Inserts
```typescript
// Use transactions for batch operations
export async function batchCacheDetections(
  detections: DetectionResult[]
): Promise<void> {
  if (!db) throw new Error('Database not initialized');
  
  await db.transaction(async (tx) => {
    for (const detection of detections) {
      await tx.executeSql(
        `INSERT OR REPLACE INTO detection_history (...) VALUES (...)`,
        [/* values */]
      );
    }
  });
}
```

#### Query Optimization
```typescript
// Use indexes
await db.executeSql(`
  CREATE INDEX IF NOT EXISTS idx_detections_user_timestamp 
  ON detection_history(user_id, detected_at DESC)
`);

// Use LIMIT for queries
const query = `
  SELECT * FROM detection_history 
  WHERE user_id = ? 
  ORDER BY detected_at DESC 
  LIMIT ? OFFSET ?
`;
```

---

## Load Testing

### Backend Load Testing with Artillery

#### Install Artillery
```bash
npm install -g artillery
```

#### Create Load Test Script
```yaml
# load-test.yml
config:
  target: 'https://api.agrinext.com'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Ramp up"
    - duration: 300
      arrivalRate: 100
      name: "Sustained load"
  defaults:
    headers:
      Content-Type: 'application/json'

scenarios:
  - name: "Authentication Flow"
    flow:
      - post:
          url: "/api/v1/auth/send-otp"
          json:
            mobileNumber: "{{ $randomPhoneNumber() }}"
      - think: 2
      - post:
          url: "/api/v1/auth/verify-otp"
          json:
            mobileNumber: "{{ $randomPhoneNumber() }}"
            otp: "123456"

  - name: "Detection History"
    flow:
      - get:
          url: "/api/v1/diseases/history?page=1&limit=20"
          headers:
            Authorization: "Bearer {{ token }}"

  - name: "Advisory Query"
    flow:
      - post:
          url: "/api/v1/advisories/query"
          headers:
            Authorization: "Bearer {{ token }}"
          json:
            query: "How to control pests?"
```

#### Run Load Test
```bash
artillery run load-test.yml
```

### Mobile App Performance Testing

#### React Native Performance Monitor
```typescript
// Enable performance monitor in development
import { PerformanceObserver } from 'react-native-performance';

const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    console.log(`${entry.name}: ${entry.duration}ms`);
  });
});

observer.observe({ entryTypes: ['measure'] });
```

#### Flipper Integration
```bash
# Install Flipper for debugging and profiling
# https://fbflipper.com/

# Enable Flipper plugins:
# - Network
# - Databases
# - Images
# - Layout
# - Performance
```

---

## Performance Benchmarks

### Backend API Benchmarks

| Endpoint | Target | Actual | Status |
|----------|--------|--------|--------|
| POST /auth/send-otp | < 2s | - | ⏳ |
| POST /auth/verify-otp | < 2s | - | ⏳ |
| POST /diseases/detect | < 30s | - | ⏳ |
| GET /diseases/history | < 2s | - | ⏳ |
| POST /advisories/query | < 5s | - | ⏳ |
| GET /advisories/history | < 2s | - | ⏳ |
| GET /schemes | < 1s | - | ⏳ |
| GET /users/profile | < 1s | - | ⏳ |

### Mobile App Benchmarks

| Metric | Target | iOS | Android | Status |
|--------|--------|-----|---------|--------|
| App Launch | < 3s | - | - | ⏳ |
| Login Flow | < 5s | - | - | ⏳ |
| Detection Upload | < 30s | - | - | ⏳ |
| History Load | < 2s | - | - | ⏳ |
| Offline Data Access | < 500ms | - | - | ⏳ |
| Language Switch | < 500ms | - | - | ⏳ |

### Database Performance

| Query Type | Target | Actual | Status |
|------------|--------|--------|--------|
| User Lookup | < 50ms | - | ⏳ |
| Detection Insert | < 100ms | - | ⏳ |
| History Query (20 items) | < 200ms | - | ⏳ |
| Scheme Query (all) | < 100ms | - | ⏳ |

---

## Monitoring and Alerting

### Application Monitoring

#### Backend Monitoring
```typescript
// Add request timing middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Log slow requests
    if (duration > 1000) {
      logger.warn('Slow request', {
        method: req.method,
        url: req.url,
        duration,
      });
    }
    
    // Log to audit
    auditLogger.logApiRequest({
      userId: req.user?.id,
      endpoint: req.url,
      method: req.method,
      status: res.statusCode,
      responseTime: duration,
    });
  });
  
  next();
});
```

#### Database Monitoring
```typescript
// Monitor connection pool
setInterval(() => {
  const poolStats = {
    total: pool.totalCount,
    idle: pool.idleCount,
    waiting: pool.waitingCount,
  };
  
  logger.info('Database pool stats', poolStats);
  
  // Alert if pool is exhausted
  if (poolStats.waiting > 10) {
    logger.error('Database pool exhausted', poolStats);
  }
}, 60000); // Every minute
```

### Performance Alerts

#### Set Up Alerts
- Response time > 5 seconds
- Error rate > 5%
- Database connections > 80% of pool
- Memory usage > 80%
- CPU usage > 80%
- Disk usage > 80%

---

## Optimization Checklist

### Backend
- [x] Database indexes created
- [x] Connection pooling configured
- [x] Caching implemented for schemes
- [x] Image compression enabled
- [x] Response compression enabled
- [x] Query optimization applied
- [ ] Load testing completed
- [ ] Performance benchmarks met

### Mobile App
- [x] Image lazy loading implemented
- [x] List rendering optimized
- [x] Offline caching enabled
- [x] State management optimized
- [x] Network requests batched
- [x] SQLite queries optimized
- [ ] Performance profiling completed
- [ ] Memory leaks fixed

### Infrastructure
- [ ] CDN configured for static assets
- [ ] Auto-scaling enabled
- [ ] Database read replicas configured
- [ ] Redis cache deployed
- [ ] Monitoring and alerting set up

---

## Next Steps

1. Run load tests with Artillery
2. Profile mobile app with Flipper
3. Measure actual performance metrics
4. Identify bottlenecks
5. Apply targeted optimizations
6. Re-test and verify improvements
7. Document final performance numbers
8. Set up continuous monitoring

---

## Sign-Off

**Optimized By**: _______________  
**Date**: _______________  
**Performance Target Met**: Yes / No / Partial  
**Notes**: _______________
