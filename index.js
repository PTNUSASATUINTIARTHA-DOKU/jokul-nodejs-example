const express = require('express');
const bodyParser = require('body-parser');
const dokuLib = require('jokul-nodejs-library');


const app = express();
const port = 3000;
app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

let apiPath = process.argv.slice(2).join('');

app.get(apiPath + '', (req, res) => {
    res.sendFile(__dirname + '/generate-payment-code.html');
});

app.post(apiPath + '/generate-va', function (req, res) {

    var response;
    var channel = req.body.channel;

    let setupConfiguration = dokuLib.SetupConfiguration;
    setupConfiguration.environment = req.body.environment;
    setupConfiguration.client_id = req.body.clientId;
    setupConfiguration.merchant_name = req.body.merchantName;
    setupConfiguration.shared_key = req.body.sharedKey;
    setupConfiguration.serverLocation = dokuLib.getServerLocation(setupConfiguration.environment);
    setupConfiguration.channel = channel;

    let paymentCodeRequest = dokuLib.PaymentCodeRequestDto;
    paymentCodeRequest.customer.name = req.body.customerName;
    paymentCodeRequest.customer.email = req.body.email;
    paymentCodeRequest.order.invoice_number = randomInvoice(30);
    paymentCodeRequest.order.amount = req.body.amount;
    paymentCodeRequest.virtual_account_info.info1 = req.body.info1;
    paymentCodeRequest.virtual_account_info.info2 = req.body.info2;
    paymentCodeRequest.virtual_account_info.info3 = req.body.info3;
    paymentCodeRequest.virtual_account_info.reusable_status = req.body.reusableStatus;
    paymentCodeRequest.virtual_account_info.expired_time = req.body.expiredTime != null ? req.body.expiredTime : '';

    if (channel == 'mandiri') {
        response = dokuLib.generateMandiriVa(setupConfiguration,paymentCodeRequest);
    } else if (channel == 'doku') {
        response = dokuLib.generateDOKUVa(setupConfiguration, paymentCodeRequest);
    } else if (channel == 'mandiri-syariah') {
        //do something
    }

    res.send(response);
});

app.post(apiPath + '/notify', function (req, res) {
    let requestBody = dokuLib.NotifyRequestDto;
    requestBody = req.body;
    // Input your process here
    let responseBody = dokuLib.NotifyResponseDto;
    responseBody = requestBody;

    res.send(responseBody);
});

function randomInvoice(length) {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

app.listen(port, () => console.log(`Application Started on port : ${port}`))
