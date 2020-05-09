const express = require ('express');
const ejs = require ('ejs');
const paypal = require ('paypal-rest-sdk');

const app = express ();

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'ASLiBEaTyOgZNBr5IzrDEMB-pB-rQgpORvFsEa0gepe-C7eN0AGqPp6B-ooWkns0_sjIZyieU64SUS1S',
    'client_secret': 'ENE4JOcYDKOKR4Tcz0JyFXd7lkpkjuPCS-KCmORLKaD3ijAcUdQ-OVCQy0rFMubmCn8VST9nDGW0Qm7B'
  });



app.post('/pay', (req, res) => {
    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/success",
            "cancel_url": "http://localhost:3000/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "Producto 1",
                    "sku": "0001",
                    "price": "500.00",
                    "currency": "MXN",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "MXN",
                "total": "500.00"
            },
            "description": "Compra en Eva's sin"
        }]
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            for (let i=0; i < payment.links.length; i++){
                if (payment.links[i].rel == 'approval_url'){
                    res.redirect(payment.links[i].href);
                }
            }

            //console.log("Create Payment Response");
            //console.log(payment);
            //res.send('test');
        }
    });

});


app.get('/success', (req, res) => {
    const payerID = req.query.PayerID;
    const paymentId = req.query.paymentId;

    const execute_payment_json = {
        "payer_id" : payerID,
        "transactions": [{
            "amount": {
                "currency":"MXN",
                "total":"500.00"
            }
        }]
    }

    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment){
        if (error) {
            console.log (error.response);
            throw error;
        }
        else {
            console.log("get payment reponse");
            console.log(JSON.stringify(payment));
            res.send('success');
        }

    });
})


app.get('/cancel', (req, res) => res.send('Cancel'));

app.set('view engine', 'ejs');

app.get('/', (req, res) => res.render('index'));

app.listen(3000, () => console.log('Server startted'));

