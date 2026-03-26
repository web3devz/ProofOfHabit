module proof_of_habit::habit {
    use std::string::{Self, String};
    use one::event;
    use one::table::{Self, Table};

    /// Each user owns their HabitLog
    public struct HabitLog has key, store {
        id: object::UID,
        owner: address,
        entries: Table<u64, HabitEntry>,
        next_id: u64,
        streak: u64,
        last_epoch: u64,
    }

    public struct HabitEntry has store, drop {
        habit_name: String,
        note: String,
        epoch: u64,
    }

    public struct HabitLogged has copy, drop {
        owner: address,
        habit_name: String,
        entry_id: u64,
        streak: u64,
        epoch: u64,
    }

    const E_NOT_OWNER: u64 = 0;

    public fun create_log(ctx: &mut TxContext) {
        let log = HabitLog {
            id: object::new(ctx),
            owner: ctx.sender(),
            entries: table::new(ctx),
            next_id: 0,
            streak: 0,
            last_epoch: 0,
        };
        transfer::transfer(log, ctx.sender());
    }

    public fun log_habit(
        log: &mut HabitLog,
        raw_habit: vector<u8>,
        raw_note: vector<u8>,
        ctx: &mut TxContext,
    ) {
        assert!(log.owner == ctx.sender(), E_NOT_OWNER);
        let habit_name = string::utf8(raw_habit);
        let note = string::utf8(raw_note);
        let epoch = ctx.epoch();
        let id = log.next_id;

        // Update streak: consecutive epochs = streak++, else reset to 1
        if (epoch == log.last_epoch + 1) {
            log.streak = log.streak + 1;
        } else if (epoch > log.last_epoch) {
            log.streak = 1;
        };
        log.last_epoch = epoch;

        table::add(&mut log.entries, id, HabitEntry { habit_name, note, epoch });
        log.next_id = id + 1;

        event::emit(HabitLogged {
            owner: log.owner,
            habit_name: string::utf8(raw_habit),
            entry_id: id,
            streak: log.streak,
            epoch,
        });
    }

    public fun owner(l: &HabitLog): address { l.owner }
    public fun streak(l: &HabitLog): u64 { l.streak }
    public fun total_logs(l: &HabitLog): u64 { l.next_id }
}
