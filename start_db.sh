#!/bin/bash

# Database Configuration
MYSQL_DATA_DIR="/Users/magobaebae/Desktop/Tracking-System-PSUIC/mysql_data"
MYSQL_BIN="/Users/magobaebae/anaconda3/bin/mysqld"

# Initialization Check (Checks for 'mysql' subdirectory)
if [ ! -d "$MYSQL_DATA_DIR/mysql" ]; then
    echo "Initializing MySQL Data Directory..."
    # Clean up potentially partial/corrupted main directory
    rm -rf "$MYSQL_DATA_DIR"
    mkdir -p "$MYSQL_DATA_DIR"
    
    # --defaults-file MUST be the first argument
    "$MYSQL_BIN" \
        --defaults-file=/dev/null \
        --initialize-insecure \
        --basedir=/Users/magobaebae/anaconda3 \
        --datadir="$MYSQL_DATA_DIR" \
        --user=magobaebae
fi

echo "Cleaning up port 3306..."
lsof -ti :3306 | xargs kill -9 2>/dev/null || true

echo "Starting Local MySQL Server..."
"$MYSQL_BIN" \
  --defaults-file=/dev/null \
  --datadir="$MYSQL_DATA_DIR" \
  --basedir=/Users/magobaebae/anaconda3 \
  --lc-messages-dir=/Users/magobaebae/anaconda3/share/mysql \
  --user=magobaebae \
  --port=3306 \
  --bind-address=127.0.0.1 \
  --console &

MYSQL_PID=$!
echo "MySQL started with PID $MYSQL_PID"
wait $MYSQL_PID
