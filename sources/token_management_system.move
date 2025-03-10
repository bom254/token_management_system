// This module implements a simple token management system on Sui.
// It keeps track of token balances for different addresses and allows minting and transferring tokens.
// The module also emits a transfer event whenever tokens are moved between addresses.

#[allow(duplicate_alias)]
module token_management_system::simple_token_management {

    // Import necessary modules from the Sui framework.
    // These modules provide support for creating new objects, managing transaction context,
    // transferring objects, using table data structures, and emitting events.
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::table::{Self, Table};
    use sui::event; 

    // Define the TokenLedger struct.
    // This structure is used to track token balances for all addresses.
    // It has:
    // - An `id` which uniquely identifies the ledger object.
    // - A `balances` table that maps addresses to their token balance (u64).
    // - A `total_supply` variable to track the total amount of tokens in circulation.
    public struct TokenLedger has key {
        id: UID,
        balances: Table<address, u64>,
        total_supply: u64,
    }

    // Define the Admin struct.
    // This struct represents an administrative capability that is required to mint new tokens.
    public struct Admin has key {
        id: UID,
    }

    // Define a TransferEvent structure.
    // This event is emitted whenever tokens are transferred from one address to another.
    // The event carries information about:
    // - The sender's address (`from`).
    // - The receiver's address (`to`).
    // - The amount of tokens transferred.
    public struct TransferEvent has copy, drop {
        from: address,
        to: address,
        amount: u64,
    }

    // The `init` function initializes the token management system.
    // It creates the shared TokenLedger and the Admin capability.
    // This function is called when the module is first deployed.
    fun init(ctx: &mut TxContext) {
        // Create a new ledger with:
        // - A unique ID.
        // - An empty table for balances.
        // - Zero total supply.
        let ledger = TokenLedger {
            id: object::new(ctx),
            balances: table::new(ctx),
            total_supply: 0,
        };

        // Share the ledger object so that it can be used by anyone.
        transfer::share_object(ledger);

        // Create the Admin capability.
        // This object gives administrative rights to mint tokens.
        let admin = Admin { id: object::new(ctx) };

        // Transfer the Admin object to the module publisher (sender).
        transfer::transfer(admin, tx_context::sender(ctx));
    }

    // The `mint` function allows the Admin to create new tokens and credit them to a specified address.
    // Only a caller with the Admin capability can successfully call this function.
    public entry fun mint(_admin: &Admin, ledger: &mut TokenLedger, to: address, amount: u64) {
        // Check if the recipient address already has a balance entry.
        // If not, initialize their balance to 0.
        if (!table::contains(&ledger.balances, to)) {
            table::add(&mut ledger.balances, to, 0);
        };

        // Retrieve the recipient's balance as a mutable reference.
        let balance = table::borrow_mut(&mut ledger.balances, to);
        // Increase the recipient's balance by the mint amount.
        *balance = *balance + amount;

        // Update the ledger's total token supply.
        ledger.total_supply = ledger.total_supply + amount;
    }

    // The `transfer` function lets a user send tokens from their address to another address.
    // It checks that the sender has enough tokens, subtracts the tokens from the sender,
    // adds the tokens to the recipient, and then emits a transfer event.
    public entry fun transfer(ledger: &mut TokenLedger, amount: u64, to: address, ctx: &mut TxContext) {
        // Get the sender's address from the transaction context.
        let from = tx_context::sender(ctx);

        // If the sender does not have a balance entry yet, initialize it to 0.
        if (!table::contains(&ledger.balances, from)) {
            table::add(&mut ledger.balances, from, 0);
        };

        // Borrow a mutable reference to the sender's balance.
        let from_balance = table::borrow_mut(&mut ledger.balances, from);
        // Ensure that the sender has enough tokens to transfer.
        assert!(*from_balance >= amount, 1);
        // Deduct the transfer amount from the sender's balance.
        *from_balance = *from_balance - amount;

        // If the recipient does not have a balance entry yet, initialize it to 0.
        if (!table::contains(&ledger.balances, to)) {
            table::add(&mut ledger.balances, to, 0);
        };

        // Borrow a mutable reference to the recipient's balance.
        let to_balance = table::borrow_mut(&mut ledger.balances, to);
        // Add the transfer amount to the recipient's balance.
        *to_balance = *to_balance + amount;

        // Emit a transfer event to log the transfer action.
        event::emit(TransferEvent { from, to, amount });
    }

    // The `balance_of` function returns the token balance of a given address.
    // If the address does not have an entry in the ledger, it returns 0.
    public fun balance_of(ledger: &TokenLedger, addr: address): u64 {
        if (table::contains(&ledger.balances, addr)) {
            *table::borrow(&ledger.balances, addr)
        } else {
            0
        }
    }
}
