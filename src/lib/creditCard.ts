import {
    Locale,
    SoftbankResponse,
    SoftbankService,
    XMLFieldData,
} from "./softbank";
import * as Encoding from "encoding-japanese";
/**
 * @enum {string}
 * @property {string} NONE 0
 * @property {string} ENCRYPTED 1
 */
export enum EncryptedFlag {
    NONE = "0",
    ENCRYPTED = "1",
}

/**
 * @enum {string}
 * @property {string} NONE 0
 * @property {string} RETURN_ALL_MARK 1
 * @property {string} RETURN_4_DIGITS 2
 */
export enum ResponseInfoType {
    NONE = "0",
    RETURN_ALL_MARK = "1",
    RETURN_4_DIGITS = "2",
}

/**
 * @enum {string}
 * @property {string} NONE 0
 * @property {string} RETURNED 1
 */
export enum CustomerInfoReturnFlag {
    NONE = "0",
    RETURNED = "1",
}

/**
 * @enum {string}
 * @property {string} NONE 0
 * @property {string} RETURNED 1
 */
export enum CardBrandReturnFlag {
    NONE = "0",
    RETURNED = "1",
}

/**
 * @constant {string}
 * @property {string} J JCB
 * @property {string} M MasterCard
 * @property {string} V Visa
 * @property {string} A American Express
 * @property {string} D Diners Club
 * @property {string} X その他
 */
export const CardBrand = {
    J: "JCB",
    V: "Visa",
    M: "MasterCard",
    A: "American Express",
    D: "Diners Club",
    X: "その他",
};

export interface SoftbankListItem {
    id: string;
    name: string;
    quantity: number;
    tax: number;
    amount: number;
}

interface PaymentMethodInfo {
    cc_number: XMLFieldData;
    cc_expiration: XMLFieldData;
    cardbrand_code: XMLFieldData;
    resrv1: XMLFieldData;
    resrv2: XMLFieldData;
    resrv3: XMLFieldData;
}

/**
 * @interface
 * @extends SoftbankResponse
 * @property {XMLFieldData} res_pay_method_info
 */
export interface SoftbankCustomerResponse extends SoftbankResponse {
    res_pay_method_info: PaymentMethodInfo;
}

/**
 * @interface
 * @extends SoftbankResponse
 * @property {XMLFieldData} res_sps_transaction_id
 * @property {XMLFieldData} res_tracking_id
 * @property {XMLFieldData} res_process_date
 */
export interface SoftbankTransactionResponse extends SoftbankResponse {
    res_sps_transaction_id: XMLFieldData;
    res_tracking_id: XMLFieldData;
    res_process_date: XMLFieldData;
}

/**
 * @constructor
 * @param {string} endpoint Softbank API endpoint
 * @param {string} merchantId Softbank API merchant ID
 * @param {string} serviceId Softbank API service ID
 * @param {string} hashKey Softbank API hash key
 * @param {string} locale Softbank API locale
 */

export class SoftbankCreditCard extends SoftbankService {
    constructor(
        endpoint: string,
        merchantId: string,
        serviceId: string,
        hashKey: string,
        locale: Locale = Locale.EN,
        debug = false
    ) {
        super(endpoint, merchantId, serviceId, hashKey, locale, debug);
    }

    /**
     * @function createUpdateCustomer
     * @memberof SoftbankCreditCard
     * @param {boolean} isCreate true: create, false: update
     * @param {string} customerId is required and must be unique
     * @param {string} encryptedFlg is required
     * @param {string} requestDate format: YYYYMMddHHmmss
     * @param {string} ccNumber is required
     * @param {string} ccExpiration is required, format: YYYYMM
     * @param {string} securityCode
     * @returns {Promise<SoftbankTransactionResponse>}
     */

    public async createUpdateCustomer(
        isCreate = true,
        customerId: string,
        encryptedFlg: EncryptedFlag = EncryptedFlag.NONE,
        requestDate: string,
        ccNumber: string,
        ccExpiration: string,
        securityCode: string
    ): Promise<SoftbankCustomerResponse> {
        const payload = {
            _declaration: {
                _attributes: { version: "1.0", encoding: "Shift_JIS" },
            },
            "sps-api-request": {
                _attributes: {
                    id: isCreate
                        ? this.requestId.CREATE_CUSTOMER_REQUEST
                        : this.requestId.UPDATE_CUSTOMER_REQUEST,
                },
                merchant_id: { _text: this.merchantId },
                service_id: { _text: this.serviceId },
                cust_code: { _text: customerId },
                encrypted_flg: { _text: encryptedFlg },
                request_date: { _text: requestDate },
                pay_method_info: {
                    cc_number: { _text: ccNumber },
                    cc_expiration: { _text: ccExpiration },
                    security_code: { _text: securityCode },
                },
                sps_hashcode: {
                    _text: this.generateHashCode(
                        customerId,
                        ccNumber,
                        ccExpiration,
                        securityCode,
                        encryptedFlg,
                        requestDate
                    ),
                },
            },
        };

        return this.request(payload);
    }

    /**
     * @public
     * @function createUpdateCustomerWithToken
     * @memberof SoftbankCreditCard
     * @param {boolean} isCreate mark true: create, false: update
     * @param {string} customerId is required and must be unique
     * @param {string} customerInfoReturnFlg is required
     * @param {EncryptedFlag} encryptedFlg is required
     * @param {string} requestDate format: YYYYMMddHHmmss
     * @param {string} token generate from web client
     * @param {string} tokenKey generate from web client
     * @param {CardBrandReturnFlag} cardbrandReturnFlg is required
     * @returns {Promise<SoftbankTransactionResponse>}
     */

    async createUpdateCustomerWithToken(
        isCreate = true,
        customerId: string,
        customerInfoReturnFlg: CustomerInfoReturnFlag = CustomerInfoReturnFlag.RETURNED,
        encryptedFlg: EncryptedFlag = EncryptedFlag.NONE,
        requestDate: string,
        token: string,
        tokenKey: string,
        cardbrandReturnFlg: CardBrandReturnFlag = CardBrandReturnFlag.RETURNED
    ): Promise<SoftbankCustomerResponse> {
        const payload = {
            _declaration: {
                _attributes: { version: "1.0", encoding: "Shift_JIS" },
            },
            "sps-api-request": {
                _attributes: {
                    id: isCreate
                        ? this.requestId.CREATE_CUSTOMER_TOKEN_REQUEST
                        : this.requestId.UPDATE_CUSTOMER_TOKEN_REQUEST,
                },
                merchant_id: { _text: this.merchantId },
                service_id: { _text: this.serviceId },
                cust_code: { _text: customerId },
                sps_cust_info_return_flg: { _text: customerInfoReturnFlg },
                encrypted_flg: { _text: encryptedFlg },
                request_date: { _text: requestDate },
                pay_option_manage: {
                    token: { _text: token },
                    token_key: { _text: tokenKey },
                    cardbrand_return_flg: { _text: cardbrandReturnFlg },
                },
                sps_hashcode: {
                    _text: this.generateHashCode(
                        customerId,
                        customerInfoReturnFlg,
                        token,
                        tokenKey,
                        cardbrandReturnFlg,
                        encryptedFlg,
                        requestDate
                    ),
                },
            },
        };

        return this.request(payload);
    }

    /**
     * @function getCustomer
     * @memberof SoftbankCreditCard
     * @param {string} customerId customerId of createUpdateCustomer or createUpdateCustomerWithToken
     * @param {CustomerInfoReturnFlag} customerReturnFlg is required
     * @param {ResponseInfoType} responseInfoType is required
     * @param {CardBrandReturnFlag} cardbrandReturnFlg is required
     * @param {EncryptedFlag} encryptedFlg is required
     * @param {string} requestDate format is YYYYMMDDHHmmss
     * @returns {Promise<SoftbankTransactionResponse>}
     */

    async getCustomer(
        customerId: string,
        customerReturnFlg: CustomerInfoReturnFlag = CustomerInfoReturnFlag.NONE,
        responseInfoType: ResponseInfoType = ResponseInfoType.NONE,
        cardbrandReturnFlg: CardBrandReturnFlag = CardBrandReturnFlag.RETURNED,
        encryptedFlg: EncryptedFlag = EncryptedFlag.NONE,
        requestDate: string
    ): Promise<SoftbankCustomerResponse> {
        const payload = {
            _declaration: {
                _attributes: { version: "1.0", encoding: "Shift_JIS" },
            },
            "sps-api-request": {
                _attributes: { id: this.requestId.GET_CUSTOMER_REQUEST },
                merchant_id: { _text: this.merchantId },
                service_id: { _text: this.serviceId },
                cust_code: { _text: customerId },
                sps_cust_info_return_flg: { _text: customerReturnFlg },
                response_info_type: { _text: responseInfoType },
                pay_option_manage: {
                    cardbrand_return_flg: { _text: cardbrandReturnFlg },
                },
                encrypted_flg: { _text: encryptedFlg },
                request_date: { _text: requestDate },
                sps_hashcode: {
                    _text: this.generateHashCode(
                        customerId,
                        customerReturnFlg,
                        responseInfoType,
                        cardbrandReturnFlg,
                        encryptedFlg,
                        requestDate
                    ),
                },
            },
        };

        return this.request(payload);
    }

    /**
     * @function createTransaction
     * @memberof SoftbankCreditCard
     * @param {string} customerId customerId from createUpdateCustomer or createUpdateCustomerWithToken
     * @param {string} orderId is required
     * @param {string} itemId is required
     * @param {string} amount is required
     * @param {CustomerInfoReturnFlag} customerReturnFlg is required
     * @param {EncryptedFlag} encryptedFlg is required
     * @param {string} requestDate format is YYYYMMDDHHmmss
     * @param {string} cardbrandReturnFlg is required
     * @returns {Promise<SoftbankTransactionResponse>}
     */

    async createTransaction(
        customerId: string,
        orderId: string,
        itemId: string,
        amount: string,
        customerReturnFlg: CustomerInfoReturnFlag,
        encryptedFlg: EncryptedFlag = EncryptedFlag.NONE,
        requestDate: string,
        itemName = ""
    ): Promise<SoftbankTransactionResponse> {
        const unicodeArray = Encoding.stringToCode(itemName);
        let itemNameBase64 = Buffer.from(itemName).toString("base64");

        if (this.locale === Locale.JA) {
            const uCode = Encoding.convert(unicodeArray, {
                to: "SJIS",
                from: "UNICODE",
            });

            itemNameBase64 = Encoding.base64Encode(uCode);
        }

        const payload: any = {
            _declaration: {
                _attributes: { version: "1.0", encoding: "Shift_JIS" },
            },
            "sps-api-request": {
                _attributes: { id: this.requestId.CREATE_TRANSACTION_REQUEST },
                merchant_id: { _text: this.merchantId },
                service_id: { _text: this.serviceId },
                cust_code: { _text: customerId },
                order_id: { _text: orderId },
                item_id: { _text: itemId },
                amount: { _text: amount },
                sps_cust_info_return_flg: { _text: customerReturnFlg },
                encrypted_flg: { _text: encryptedFlg },
                request_date: { _text: requestDate },
                sps_hashcode: {
                    _text: this.generateHashCode(
                        customerId,
                        orderId,
                        itemId,
                        itemName,
                        amount,
                        customerReturnFlg,
                        encryptedFlg,
                        requestDate
                    ),
                },
            },
        };

        if (itemName) {
            payload["sps-api-request"]["item_name"] = {
                _text: itemNameBase64,
            };
        }

        return this.request(payload);
    }

    /**
     * @function confirmTransaction
     * @memberof SoftbankCreditCard
     * @param {string} transactionId transactionId from createTransaction
     * @param {string} trackingId trackingId from createTransaction
     * @param {string} requestDate requestDate format YYYYMMDDHHmmss
     * @returns {Promise<SoftbankTransactionResponse>}
     */

    async confirmTransaction(
        transactionId: string,
        trackingId: string,
        requestDate: string
    ): Promise<SoftbankTransactionResponse> {
        const payload = {
            _declaration: {
                _attributes: { version: "1.0", encoding: "Shift_JIS" },
            },
            "sps-api-request": {
                _attributes: { id: this.requestId.CONFIRM_TRANSACTION_REQUEST },
                merchant_id: { _text: this.merchantId },
                service_id: { _text: this.serviceId },
                request_date: { _text: requestDate },
                sps_hashcode: {
                    _text: this.generateHashCode(
                        transactionId,
                        trackingId,
                        requestDate
                    ),
                },
                sps_transaction_id: { _text: transactionId },
                tracking_id: { _text: trackingId },
            },
        };

        return this.request(payload);
    }

    /**
     * @function requestPurchase
     * @memberof SoftbankCreditCard
     * @param {string} transactionId transactionId from createTransaction request
     * @param {string} trackingId trackingId from createTransaction request
     * @param {string} processDate processDate from createTransaction request
     * @param {string} requestDate requestDate format YYYYMMDDHHmmss
     * @returns {Promise<SoftbankTransactionResponse>}
     */

    async requestPurchase(
        transactionId: string,
        trackingId: string,
        processDate: string,
        requestDate: string
    ): Promise<SoftbankTransactionResponse> {
        const payload = {
            _declaration: {
                _attributes: { version: "1.0", encoding: "Shift_JIS" },
            },
            "sps-api-request": {
                _attributes: { id: this.requestId.PURCHASE_REQUEST },
                merchant_id: { _text: this.merchantId },
                service_id: { _text: this.serviceId },
                request_date: { _text: requestDate },
                sps_hashcode: {
                    _text: this.generateHashCode(
                        transactionId,
                        trackingId,
                        processDate,
                        requestDate
                    ),
                },
                sps_transaction_id: { _text: transactionId },
                tracking_id: { _text: trackingId },
                processing_datetime: { _text: processDate },
            },
        };

        return this.request(payload);
    }

    /**
     * @function refundPurchase
     * @memberof SoftbankCreditCard
     * @param {string} transactionId transactionId from createTransaction request
     * @param {string} trackingId trackingId from createTransaction request
     * @param {string} processDate processDate from createTransaction request
     * @param {string} requestDate requestDate format YYYYMMDDHHmmss
     * @returns {Promise<SoftbankTransactionResponse>}
     */

    async refundPurchase(
        transactionId: string,
        trackingId: string,
        processDate: string,
        requestDate: string
    ): Promise<SoftbankTransactionResponse> {
        const payload = {
            _declaration: {
                _attributes: { version: "1.0", encoding: "Shift_JIS" },
            },
            "sps-api-request": {
                _attributes: { id: this.requestId.REFUND_REQUEST },
                merchant_id: { _text: this.merchantId },
                service_id: { _text: this.serviceId },
                request_date: { _text: requestDate },
                sps_hashcode: {
                    _text: this.generateHashCode(
                        transactionId,
                        trackingId,
                        processDate,
                        requestDate
                    ),
                },
                sps_transaction_id: { _text: transactionId },
                tracking_id: { _text: trackingId },
                processing_datetime: { _text: processDate },
            },
        };

        return this.request(payload);
    }
}
