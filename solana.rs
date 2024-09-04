use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct RedeemShares<'info> {
    #[account(mut)]
    pub sender: Signer<'info>,
    #[account(mut)]
    pub market: Account<'info, Market>,
    #[account(mut)]
    pub market_account: AccountInfo<'info>,
}

#[program]
pub mod my_program {
    use super::*;

    pub fn redeem_shares(ctx: Context<RedeemShares>, market_id: u64) -> ProgramResult {
        let sender = &ctx.accounts.sender;
        let market = &mut ctx.accounts.market;
        let market_account = &ctx.accounts.market_account;

        // Ensure the market is resolved
        if market.status != MarketStatus::Resolved {
            return Err(ErrorCode::MarketIsNotResolved.into());
        }

        // Ensure the market is redeemable
        if !market.is_redeemable() {
            return Err(ErrorCode::InvalidResolutionMechanism.into());
        }

        // Check to see if the sender has any winning shares.
        let resolved_outcome = market.resolved_outcome;
        let sender_shares = market.get_shares(sender.key, resolved_outcome);

        if sender_shares == 0 {
            return Err(ErrorCode::NoWinningShares.into());
        }

        // Calculate the payout
        let payout = market.calculate_payout(sender_shares);

        // Transfer the payout to the sender
        **market_account.try_borrow_mut_lamports()? -= payout;
        **sender.try_borrow_mut_lamports()? += payout;

        // Update the market to reflect the redeemed shares
        market.redeem_shares(sender.key, resolved_outcome);

        Ok(())
    }
}

#[account]
pub struct Market {
    pub status: MarketStatus,
    pub resolved_outcome: u64,
    pub total_shares: u64,
    pub total_payout: u64,
    pub shares: Vec<ShareRecord>, // List of shares owned by participants
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum MarketStatus {
    Open,
    Closed,
    Resolved,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct ShareRecord {
    pub owner: Pubkey,
    pub outcome: u64,
    pub amount: u64,
}

impl Market {
    pub fn is_redeemable(&self) -> bool {
        // Implement the logic to check if the market is redeemable
        self.status == MarketStatus::Resolved
    }

    pub fn get_shares(&self, owner: Pubkey, outcome: u64) -> u64 {
        self.shares
            .iter()
            .find(|&record| record.owner == owner && record.outcome == outcome)
            .map(|record| record.amount)
            .unwrap_or(0)
    }

    pub fn calculate_payout(&self, shares: u64) -> u64 {
        // Implement the logic to calculate the payout based on shares
        // Example: payout is proportional to the total payout pool
        (shares as u128 * self.total_payout as u128 / self.total_shares as u128) as u64
    }

    pub fn redeem_shares(&mut self, owner: Pubkey, outcome: u64) {
        if let Some(index) = self
            .shares
            .iter()
            .position(|record| record.owner == owner && record.outcome == outcome)
        {
            self.shares.remove(index);
        }
    }
}

#[error]
pub enum ErrorCode {
    #[msg("The market is not resolved.")]
    MarketIsNotResolved,
    #[msg("Invalid resolution mechanism.")]
    InvalidResolutionMechanism,
    #[msg("No winning shares.")]
    NoWinningShares,
}
