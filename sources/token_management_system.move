module token_management_system{
    use std::signer;    // Helps us know who is calling the function
    use std::error;     // Helps us handle mistakes
    use std::string::String;    // Lets us work with text

    /* This is like a blueprint for the token. It's a "struct (a way to store data)
     It will live on the blockchain */
    public struct Token has key {
        id:object::UID,
        total_supply: u64,  // Tracks how many tokens exist in total
        balances: table::Table<address, u64>,   // A table that says "who owns how many tokens"
        minters: table::Table<address, bool>,   // a table that says "who us allowed to make new token"
    }

    // This function sets up the system for the first time.
    // Only one person ( the creator) can call this to start things
    public entry fun initialize (account: &signer) {
        // Create a new token "object" with starting values
        let token = Token {
            id: object::new_id,
            total_supply: 0,    // Start with zero
            balances: table::new(),      // An empty list of who owns tokens
            minters: table::new()       // An empty list of who can make tokens
        };

        // The person calling this (the account) becomes the first minter.account// We use "signer::address_of" to get their unique address
        table::add(&mut token.minters, signer::address_of(account), true);
        // save the token data under the creator's account on the blockchain
        move_to(account, token);
    }

    // This function makes new tokens (called "minting")
    // Only people listed as "minters" can do this
    public entry fun mint(account: &signer, amount: u64) acquires Token {
        // Get the address of the person calling this function
        let sender = signer::address_of(account);
        // Look up the token data ( we need to change it, so we use "mut" for mutable)
        let token = borrow_global_mut<Token>(@token_management_system);
        // Check how many tokens the sender has
        let sender_balance = get_balance_internal(sender, token);
        // Make sure they have enough tokens to send (if not, stop with an error)
        assert!(sender_balance >= amount, error::invalid_argument(2));
        // Take the tokens away from the sender
        table::upsert(&mut token.balances, sender, sender_balance - amount);
        // Add the tokens to the recipient's balance
        let recipient_balance = get_balance_internal(to, token);
        table::upsert(&mut token.balances, to, recipient_balance + amount);
    }

    // This funcion lets anyone check how many tokens someone has
    public fun balance_of(account: address): u64 acquires Token {
        // Look up the token data
        let token = borrow_global<Token>(@token_management_system);
        // Use a helper function to get the balance (returns 0 if they have none)
        get_balance_internal(account, token)
    }

    // A helper function to check someone's balance
    fun get_balance_internal(account: address, token: &Token): u64 {
        // Check if this person has any tokens listed in the balances table
        if(table::contains(&token.balances, account)) {
            // If yes, return their balance
            *table::borrow(&token.balances, account)
        } else {
            // If no, they have 0 tokens
            0
        }
    }

    // This function lets an existing minter giv someone else permission to mint
    public entry fun add_minter(account: &signer, new_minter: address) acquires Token {
        // Get the caller's address
        let sender = signer::address_of(account);
        // Look up the token data
        let token = borrow_global_mut<Token>(@token_management_system);
        // Make sure the caller is already a minter 
        assert!(table::contains(&token.minters, sender), error::permission_denied(3));
        // Add the new person to the minters list 
        table::upsert(&mut token.minters, new_minter, true);
    }
}