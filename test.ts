import {
    CustomerInfoReturnFlag,
    EncryptedFlag,
    Locale,
    SoftbankCreditCard,
} from "./src/index";

const ins = new SoftbankCreditCard(
    "https://stbfep.sps-system.com//api/xmlapi.do",
    "30132",
    "103",
    "ed679e1c9f90c2ab96b25d5c580b58e25192eb5d",
    Locale.JA,
    true
);

const main = async () => {
    const a = await ins.createTransaction(
        "Merchant_TestUser_999999",
        "1b8759bcaa20220929225129fa0171d49611",
        "1",
        "10",
        CustomerInfoReturnFlag.RETURNED,
        EncryptedFlag.NONE,
        "20220929225129",
        "年払い初期費用10万円プラン"
    );

    console.log(a);
};

main();
