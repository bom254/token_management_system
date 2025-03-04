#[allow(duplicate_alias)]
module token_management_system::simple_token_management {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    // Import table to manage balances
    use sui::table::{Self, Table};

    // Define the TokenLedger struct to manage all token balances
    public struct TokenLedger has key {
        id: UID,
        balances: Table<address, u64>,  // Maps address to their token balances
        total_supply: u64   // Trakcs total in circulation
    }

    // Define an Admin capability to restrict minting
    public struct Admin has key {
        id: UID,
    }

    // Initialize the module: Create the shared TokenLedger and admin capability
    fun init(ctx: &mut TxContext) {
        // Create the shared ledger
        let ledger = TokenLedger {
            id: object::new(ctx),
            balances: table::new(ctx),
            total_supply: 0,
        };

        // Shared the ledger so anyone can interact with it
        transfer::share_object(ledger);

        // Create the Admin capability and transfer it to the module publisher
        let admin = Admin {
            id: object::new(ctx),
        };
        transfer::transfer(admin, tx_context::sender(ctx));
    }

    // Mint tokens to an address (restricted to Admin)
    public entry fun mint(_admin: &Admin, ledger: &mut TokenLedger, to: address, amount: u64) {
        // Only the Admin capability owner can call this (enforced by ownership)
        // If the recipient has no balance entry, initialize it to 0
        if(!table::contains(&ledger.balances, to)) {
            table::add(&mut ledger.balances, to, 0);
        };

        // Increase the recipient's balance
        let balance = table::borrow_mut(&mut ledger.balances, to);
        *balance = *balance + amount;
        // Update total supply
        ledger.total_supply = ledger.total_supply + amount;
    }

    // Transfer tokens from the sender to another address
    public entry fun transfer(ledger: &mut TokenLedger, amount: u64, to: address, ctx: &mut TxContext) {
        let from = tx_context::sender(ctx); // Get the sender's address
        // If the sender has no balance entry, initialized it to 0
        if(!table::contains(&ledger.balances, from)) {
            table::add(&mut ledger.balances, from, 0);
        };

        // Check and update the sender's balance
        let from_balance = table::borrow_mut(&mut ledger.balances, from);
        assert!(*from_balance >= amount, 1);   // Ensure suffient balances
        *from_balance = * from_balance - amount;

        // If the recipient has no balance entry, initialize it to 0
        if(!table::contains(&ledger.balances, to)) {
            table::add(&mut ledger.balances, to, 0);
        };

        // Increase the recipient's balance
        let to_balance = table::borrow_mut(&mut ledger.balances, to);
        *to_balance = *to_balance + amount;
    }

    // Check an address's balance
    public fun balance_of(ledger: &TokenLedger, addr: address): u64 {
        if(table::contains(&ledger.balances, addr)) {
            *table::borrow(&ledger.balances, addr) // Return the balance if it exists
        } else {
            0 // Return 0 if no balance entry
        }
    }
}