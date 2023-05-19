# Softbank API Nodejs
## Install

```
npm install softbankjs
```
or
```
yarn add softbankjs
```

## How to use
```javascript
import { SoftbankCreditCard } from 'softbankjs';


const sbInstance = new SoftbankCreditCard(endpoint, merchantId, serviceId, hashKey, locale);

const transaction = await sbInstance.createTransaction(customerId, orderId, itemId, amount, customerReturnFlg, encryptedFlg, requestDate, cardbrandReturnFlg);
await sbInstance.requestPurchase(transactionId, trackingId, processDate, requestDate);
await sbInstance.confirmTransaction(transactionId, trackingId, requestDate)

```

More docs: [Here](https://huy97.github.io/softbank)
