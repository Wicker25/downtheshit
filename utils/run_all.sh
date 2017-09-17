#!/usr/bin/env bash
LOG_FILE='logs/output.log'

echo '=====' $(date) '=====' >> "$LOG_FILE"

npm run selenium &
SELENIUM_PID=$!

sleep 5
npm start | tee -a "$LOG_FILE"
kill -9 $SELENIUM_PID