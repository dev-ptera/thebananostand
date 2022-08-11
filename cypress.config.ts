import { defineConfig } from 'cypress';

export default defineConfig({
    e2e: {
        baseUrl: 'http://localhost:4200',
        chromeWebSecurity: false,
        video: false,
        setupNodeEvents(on, config) {
            require("cypress-localstorage-commands/plugin")(on, config);
            // implement node event listeners here
        },
    },
});
