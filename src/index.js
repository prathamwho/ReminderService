const express = require('express');
const bodyParser = require('body-parser');

const { PORT } = require('./config/serverConfig');
const cron = require('node-cron');

// const { sendBasicEmail } = require('./services/email-service');

const setupAndStartServer = () => {
    const app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.listen(PORT, () => {
        console.log(`Server started at port: ${PORT}`);

        // sendBasicEmail(
        //     '"Support" <support@admin.com>',
        //     'isaidwhoasked@gmail.com',
        //     'This is a testing mail',
        //     'Hey, How are you, I hope you like the support'
        // )

        // cron.schedule('*/2 * * * *', () => {
        //     console.log('running a task every two minutes');
        // });
    });
}

setupAndStartServer();