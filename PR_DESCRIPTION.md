# Fix: Ensure Consistent Button Alignment When User Has No Position

## Description

This PR fixes issue #98 where button placement was uneven when a user had no position with an operator.

## Changes Made

- **OperatorCard**: Always show both Stake and Withdraw buttons, but disable Withdraw when no position exists
- **OperatorTable**: Always show both Stake and Withdraw buttons, but disable Withdraw when no position exists  
- **Position Display**: Show 0.00 instead of '--' when user has no position with an operator
- **Consistent Layout**: Maintains uniform button alignment regardless of user's staking status

## Technical Details

- Modified `hasUserPosition` logic to always render both buttons
- Added `disabled` prop to Withdraw button when `!hasUserPosition`
- Updated position display to show 0.00 for consistency
- Preserved existing functionality while improving UI consistency

## Testing

- [x] Linting passes
- [x] Type checking passes
- [x] Maintains existing functionality
- [x] Improves UI consistency

## Screenshots

The fix ensures that:
1. Users with no positions see both buttons (Withdraw disabled)
2. Users with positions see both buttons (Withdraw enabled)
3. Position values show 0.00 instead of '--' for consistency

## Files Changed

- `apps/web/src/components/operators/OperatorCard.tsx`
- `apps/web/src/components/operators/OperatorTable.tsx`

Closes #98