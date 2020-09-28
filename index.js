const express = require('express');
const bodyParser = require('body-parser');
const dokuLib = require('jokul-nodejs-library');


const app = express();
const port = 3000;
app.use(bodyParser.urlencoded({extended: true}));

app.use(bodyParser.json());

let path = require("path");
let absolutePath = path.resolve('');

app.get('/', (req, res) => {
    res.sendFile(absolutePath + '/generate-payment-code.html');
});

app.post('/generate-va', function (req, res) {

    let setupConfiguration = dokuLib.SetupConfiguration;
    setupConfiguration.environment = req.body.environment;
    setupConfiguration.client_id = req.body.clientId;
    setupConfiguration.merchant_name = req.body.merchantName;
    setupConfiguration.shared_key = req.body.sharedKey;
    setupConfiguration.serverLocation = dokuLib.getServerLocation(setupConfiguration.environment);

    let paymentCodeRequest = dokuLib.PaymentCodeRequestDto;
    paymentCodeRequest.client.id = setupConfiguration.client_id;
    paymentCodeRequest.customer.name = req.body.customerName;
    paymentCodeRequest.customer.email = req.body.email;
    paymentCodeRequest.order.invoice_number = randomInvoice(30);
    paymentCodeRequest.order.amount = req.body.amount;
    paymentCodeRequest.virtual_account_info.info1 = req.body.info1;
    paymentCodeRequest.virtual_account_info.info2 = req.body.info2;
    paymentCodeRequest.virtual_account_info.info3 = req.body.info3;
    paymentCodeRequest.virtual_account_info.reusable_status = req.body.reusableStatus;
    paymentCodeRequest.virtual_account_info.expired_time = req.body.expiredTime;
    paymentCodeRequest.security.check_sum = dokuLib.getCheckSum(setupConfiguration, paymentCodeRequest);
    let responseMandiri = dokuLib.generateMandiriVa(setupConfiguration.serverLocation, paymentCodeRequest);

    res.send(responseMandiri);
});

app.post('/notify', function (req, res) {


    let requestBody = dokuLib.NotifyRequestDto;
    requestBody.client.id = req.client.id;
    requestBody.virtual_account_info.virtual_account_number = req.body.virtual_account_info.virtual_account_number;
    requestBody.order.amount = req.body.order.amount;
    requestBody.virtual_account_payment.date = req.body.virtual_account_payment.date;
    requestBody.virtual_account_payment.channel_code = req.body.virtual_account_payment.channel_code;
    requestBody.virtual_account_payment.reference_number = req.body.virtual_account_payment.reference_number;
    requestBody.virtual_account_payment.systrace_number = req.body.virtual_account_payment.systrace_number;
    requestBody.order.invoice_number = req.body.order.invoice_number;
    requestBody.security.check_sum = req.body.security.check_sum;

    // Input your process here

    let responseBody = dokuLib.NotifyResponseDto;
    responseBody.client.id = requestBody.client.id;
    responseBody.virtual_account_info.virtual_account_number = requestBody.virtual_account_info.virtual_account_number;
    responseBody.order.amount = requestBody.order.amount;
    responseBody.order.invoice_number = requestBody.order.invoice_number;
    responseBody.security.check_sum = requestBody.security.check_sum;

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
