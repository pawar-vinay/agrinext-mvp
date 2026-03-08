#!/bin/bash
# Check backend error logs on EC2

cd /home/ssm-user/agrinext-phase2/backend

echo "=== Checking Backend Error Logs ==="
echo ""

# Check if logs directory exists
if [ -d "logs" ]; then
    echo "Logs directory exists"
    echo ""
    
    echo "=== Error Log (last 50 lines) ==="
    if [ -f "logs/error.log" ]; then
        tail -50 logs/error.log
    else
        echo "No error.log file found"
    fi
    
    echo ""
    echo "=== Combined Log (last 50 lines) ==="
    if [ -f "logs/combined.log" ]; then
        tail -50 logs/combined.log
    else
        echo "No combined.log file found"
    fi
else
    echo "Logs directory does not exist"
fi

echo ""
echo "=== Backend stdout/stderr (backend.log) ==="
if [ -f "backend.log" ]; then
    tail -100 backend.log
else
    echo "No backend.log file found"
fi

echo ""
echo "=== Testing environment variable availability in running process ==="
BACKEND_PID=$(ps aux | grep "tsx src/server.ts" | grep -v grep | awk '{print $2}')
if [ -n "$BACKEND_PID" ]; then
    echo "Backend PID: $BACKEND_PID"
    echo ""
    echo "Environment variables in process:"
    sudo cat /proc/$BACKEND_PID/environ | tr '\0' '\n' | grep -E "TWILIO|DB_|JWT_|OPENAI|NODE_ENV" | head -20
else
    echo "Backend process not running"
fi
