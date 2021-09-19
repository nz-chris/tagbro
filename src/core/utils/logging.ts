export const log = console.log;

export const err = (prefix: string, error: Error | null = null) => {
    console.error(`${prefix}${error ? ` ${error.message}` : ''}`);

    const errorReceiver = process.env.ERROR_RECEIVER_ID;
    if (error && errorReceiver) {
        bot.users.fetch(errorReceiver).then(user => {
            user.send(`${prefix}\n${error.stack}`).then(/* i don't care */);
        });
    }
};
