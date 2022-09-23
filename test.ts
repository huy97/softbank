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
    Locale.EN,
    true
);

const main = async () => {
    const a = await ins.createTransaction(
        "Merchant_TestUser_999999",
        "1b8759bcaa5ae048c31d46fa0171d496",
        "1",
        "10",
        CustomerInfoReturnFlag.RETURNED,
        EncryptedFlag.NONE,
        "20220923184622",
        "年払い初期費用10万円プラン"
    );

    console.log(a);
};

main();
