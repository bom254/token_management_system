#[test(account = @0x1)]
public entry fun test_mint_and_transfer(account: &signer) acquires Token {
    // Step 1: Set up the token system
    initialize(account);
    // Step 2: Make 1000 new tokens for the caller
    mint(account, 1000);
    // Check: Did they get 1000 tokens?
    assert!(balance_of(signer::address_of(account)) == 1000, 1);
    // Step 3: Send 500 tokens to another address (0x2)
    transfer(account, @0x2, 500);
    // Check: Does the sender now have 500 tokens
    assert!(balance_of(@0x2) == 500, 3);
}
