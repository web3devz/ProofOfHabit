module proof_of_habit::habit {
    use std::vector;

    use sui::event;
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;

    public struct HabitLog has key, store {
        id: UID,
        owner: address,
        entries: vector<Entry>,
    }

    public struct Entry has drop, store {
        habit_name: vector<u8>,
        note: vector<u8>,
        timestamp_epoch: u64,
    }

    public struct HabitEvent has copy, drop {
        owner: address,
        habit_name: vector<u8>,
        timestamp_epoch: u64,
    }

    fun init(ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);
        let log = HabitLog {
            id: object::new(ctx),
            owner: sender,
            entries: vector::empty(),
        };
        transfer::transfer(log, sender);
    }

    public entry fun log(
        log: &mut HabitLog,
        habit_name: vector<u8>,
        note: vector<u8>,
        ctx: &TxContext,
    ) {
        assert!(log.owner == tx_context::sender(ctx), 0);
        let entry = Entry {
            habit_name: habit_name.clone(),
            note,
            timestamp_epoch: tx_context::epoch(ctx),
        };
        vector::push_back(&mut log.entries, entry);
        event::emit(HabitEvent { owner: log.owner, habit_name, timestamp_epoch: tx_context::epoch(ctx) });
    }
}
