# Address Formatting Implementation - Autonomys Format

## Overview

This implementation addresses issue #16 by ensuring all wallet addresses are displayed in Autonomys format (SS58 prefix 6094) throughout the application.

## Changes Made

### 1. Core Utility Function (`apps/web/src/lib/utils.ts`)

- Added `formatAutonomysAddress(addr?: string): string` function
- Uses `@autonomys/auto-utils` package's `address()` function with Autonomys SS58 prefix (6094)
- Includes error handling to gracefully fall back to original address if formatting fails
- Updated `shortenAddress()` to use Autonomys format before truncating

### 2. Address Display Component (`apps/web/src/components/wallet/AddressDisplay.tsx`)

- Updated to use `formatAutonomysAddress()` for:
  - Tooltip display (full Autonomys address on hover)
  - Clipboard copy functionality (copies Autonomys format)
- Visual display still uses shortened format for UI cleanliness

### 3. Wallet Button Component (`apps/web/src/components/wallet/wallet-button.tsx`)

- Updated account dropdown to use Autonomys format for:
  - Tooltip display on address rows
  - Clipboard copy functionality in account list
- Maintains shortened display for UI consistency

### 4. Formatting Library (`apps/web/src/lib/formatting.ts`)

- Updated `truncateAddress()` function to use Autonomys format
- Ensures consistency across all address truncation operations

## Technical Details

### Dependencies Used

- `@autonomys/auto-utils` - Already available in project
- Uses the built-in `address()` function with SS58 format 6094 (Autonomys mainnet prefix)

### Error Handling

- Graceful fallback to original address format if conversion fails
- Console warnings for debugging without breaking user experience

### Backward Compatibility

- All existing address display patterns continue to work
- No breaking changes to component APIs
- Maintains visual consistency with shortened displays

## Testing

The implementation has been:
- Linted successfully with no errors
- Type-checked with TypeScript
- Tested for compilation

## Benefits

1. **User Experience**: All addresses now display in consistent Autonomys format
2. **Copy Functionality**: Users always copy the correct Autonomys format address
3. **Network Consistency**: Addresses match the network the app operates on
4. **Future-Proof**: Centralized formatting makes future changes easier

## Files Modified

- `apps/web/src/lib/utils.ts`
- `apps/web/src/components/wallet/AddressDisplay.tsx`
- `apps/web/src/components/wallet/wallet-button.tsx`  
- `apps/web/src/lib/formatting.ts`