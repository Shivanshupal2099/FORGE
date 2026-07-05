const mongoose=require('mongoose')

const userSessionSchema= new mongoose.Schema({

  "table": "user_sessions",
  "description": "Stores active user login sessions and refresh tokens.",
  "columns": [
    {
      "name": "id",
      "type": "UUID",
      "primary_key": true,
      "default": "UUIDv4",
      "nullable": false,
      "description": "Unique session identifier"
    },
    {
      "name": "user_id",
      "type": "UUID",
      "foreign_key": {
        "table": "users",
        "column": "id",
        "on_delete": "CASCADE",
        "on_update": "CASCADE"
      },
      "nullable": false,
      "description": "Reference to the authenticated user"
    },
    {
      "name": "refresh_token",
      "type": "VARCHAR(512)",
      "nullable": false,
      "description": "Hashed JWT refresh token"
    },
    {
      "name": "device_info",
      "type": "JSON",
      "nullable": true,
      "description": "Information about the user's device, browser, and operating system"
    },
    {
      "name": "ip_address",
      "type": "VARCHAR(45)",
      "nullable": false,
      "description": "IPv4 or IPv6 address of the client"
    },
    {
      "name": "expires_at",
      "type": "TIMESTAMP",
      "nullable": false,
      "description": "Refresh token expiration timestamp"
    },
    {
      "name": "created_at",
      "type": "TIMESTAMP",
      "nullable": false,
      "default": "CURRENT_TIMESTAMP",
      "description": "Session creation timestamp"
    }
  ],
  "indexes": [
    {
      "name": "idx_user_sessions_user_id",
      "columns": ["user_id"]
    },
    {
      "name": "idx_user_sessions_refresh_token",
      "columns": ["refresh_token"],
      "unique": true
    },
    {
      "name": "idx_user_sessions_expires_at",
      "columns": ["expires_at"]
    }
  ]
})

module.exports=mongoose.model("UserSession","userSessionSchema")
