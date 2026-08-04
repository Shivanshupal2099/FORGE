const mongoose = require('mongoose');

/**
 * Migration script to fix the cashfree_payment_id unique index issue
 * 
 * Problem: MongoDB treats multiple null values as duplicates in a unique index
 * Solution: Use a partial unique index that only indexes documents where cashfree_payment_id is a string
 * 
 * This script is idempotent and can be run multiple times safely.
 */

async function fixCashfreePaymentIdIndex() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/forge';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const transactionsCollection = db.collection('transactions');

    // Step 1: Check if the old index exists
    const indexes = await transactionsCollection.indexes();
    const oldIndex = indexes.find(index => index.name === 'cashfree_payment_id_1');

    if (oldIndex) {
      console.log('Found existing cashfree_payment_id_1 index:', oldIndex);
      
      // Step 2: Drop the old index
      try {
        await transactionsCollection.dropIndex('cashfree_payment_id_1');
        console.log('Successfully dropped old cashfree_payment_id_1 index');
      } catch (error) {
        if (error.code === 27) {
          console.log('Index does not exist, skipping drop');
        } else {
          throw error;
        }
      }
    } else {
      console.log('No existing cashfree_payment_id_1 index found');
    }

    // Step 3: Clean existing data - unset cashfree_payment_id where it's null
    console.log('Cleaning existing data...');
    const cleanResult = await transactionsCollection.updateMany(
      { cashfree_payment_id: null },
      { $unset: { cashfree_payment_id: "" } }
    );
    console.log(`Cleaned ${cleanResult.modifiedCount} documents with null cashfree_payment_id`);

    // Step 4: Create the new partial unique index
    console.log('Creating new partial unique index on cashfree_payment_id...');
    try {
      await transactionsCollection.createIndex(
        { cashfree_payment_id: 1 },
        {
          unique: true,
          partialFilterExpression: {
            cashfree_payment_id: { $type: "string" }
          },
          name: 'cashfree_payment_id_1'
        }
      );
      console.log('Successfully created new partial unique index on cashfree_payment_id');
    } catch (error) {
      if (error.code === 85) {
        console.log('Index already exists, skipping creation');
      } else {
        throw error;
      }
    }

    // Step 5: Verify the new index
    const newIndexes = await transactionsCollection.indexes();
    const newIndex = newIndexes.find(index => index.name === 'cashfree_payment_id_1');
    console.log('New index configuration:', newIndex);

    console.log('Migration completed successfully!');

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the migration if this file is executed directly
if (require.main === module) {
  fixCashfreePaymentIdIndex()
    .then(() => {
      console.log('Migration script finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = fixCashfreePaymentIdIndex;
