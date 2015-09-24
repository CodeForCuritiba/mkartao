if (process.env.ENVIRONMENT == 'production') {
    Kadira.connect(process.env.KADIRA_APP_ID, process.env.KADIRA_APP_SECRET);
}
