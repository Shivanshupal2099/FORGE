
const mongoose=require('mongoose')

const userSchema= new mongoose.Schema({

  "table": "users",
  "description": "Core User Accounts (Authentication)",
  "columns": [
    {
      "name": "id",
      "type": "UUID",
      "primary_key": true,
      "default": "UUIDv4",
      "nullable": false,
      "description": "Unique user identifier"
    },
    {
      "name": "email",
      "type": "VARCHAR(320)",
      "unique": true,
      "nullable": false,
      "description": "College or personal email address"
    },
    {
      "name": "password_hash",
      "type": "VARCHAR(255)",
      "nullable": true,
      "description": "Hashed password (bcrypt or Argon2)"
    },
    {
      "name": "auth_provider",
      "type": "ENUM",
      "values": [
        "email",
        "google"
      ],
      "nullable": false,
      "default": "email",
      "description": "Authentication provider"
    },
    {
      "name": "is_verified",
      "type": "BOOLEAN",
      "nullable": false,
      "default": false,
      "description": "Whether email/phone has been verified"
    },
    {
      "name": "is_active",
      "type": "BOOLEAN",
      "nullable": false,
      "default": true,
      "description": "Account active status"
    },
    {
      "name": "last_login_at",
      "type": "TIMESTAMP",
      "nullable": true,
      "description": "Last successful login"
    },
    {
      "name": "created_at",
      "type": "TIMESTAMP",
      "nullable": false,
      "default": "CURRENT_TIMESTAMP",
      "description": "Account creation timestamp"
    },
    {
      "name": "updated_at",
      "type": "TIMESTAMP",
      "nullable": false,
      "default": "CURRENT_TIMESTAMP",
      "description": "Last update timestamp"
    },
    {
      "name": "deleted_at",
      "type": "TIMESTAMP",
      "nullable": true,
      "description": "Soft delete timestamp"
    }
  ]

})



module.exports=mongoose.model('User',userSchema)