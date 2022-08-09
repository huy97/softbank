import { SoftbankResponse, SoftbankService, XMLFieldData } from "./softbank";

export enum EncryptedFlag {
    NONE = "0",
    ENCRYPTED = "1",
}

export enum ResponseInfoType {
    NONE = "0",
    RETURN_ALL_MARK = "1",
    RETURN_4_DIGITS = "2",
}

export enum CustomerInfoReturnFlag {
    NONE = "0",
    RETURNED = "1",
}

export enum CardBrandReturnFlag {
    NONE = "0",
    RETURNED = "1",
}

export const CardBrand = {
    J: "JCB",
    V: "Visa",
    M: "Master",
    A: "AMEX",
    D: "Diners",
    X: "その他",
};

interface PaymentMethodInfo {
    cc_number: XMLFieldData;
    cc_expiration: XMLFieldData;
    cardbrand_code: XMLFieldData;
    resrv1: XMLFieldData;
    resrv2: XMLFieldData;
    resrv3: XMLFieldData;
}

export interface SoftbankCustomerResponse extends SoftbankResponse {
    res_pay_method_info: PaymentMethodInfo;
}

export interface SoftbankTransactionResponse extends SoftbankResponse {
    res_sps_transaction_id: XMLFieldData;
    res_tracking_id: XMLFieldData;
    res_process_date: XMLFieldData;
}

export class SoftbankCreditCard extends SoftbankService {
    constructor(
        endpoint: string,
        merchantId: string,
        serviceId: string,
        hashKey: string
    ) {
        super(endpoint, merchantId, serviceId, hashKey);
    }

    /**
     *
     * @param isCreate true: create, false: update
     * @param customerId is required and must be unique
     * @param encryptedFlg is required
     * @param requestDate format: YYYYMMddHHmmss
     * @param ccNumber is required
     * @param ccExpiration is required, format: YYYYMM
     * @param securityCode
     * @returns
     */

    async createUpdateCustomer(
        isCreate: boolean = true,
        customerId: string,
        encryptedFlg: string = "1",
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
     *
     * @param isCreate mark true: create, false: update
     * @param customerId is required and must be unique
     * @param customerInfoReturnFlg is required
     * @param encryptedFlg is required
     * @param requestDate format: YYYYMMddHHmmss
     * @param token generate from web client
     * @param tokenKey generate from web client
     * @param cardbrandReturnFlg is required
     * @returns
     */

    async createUpdateCustomerWithToken(
        isCreate: boolean = true,
        customerId: string,
        customerInfoReturnFlg: CustomerInfoReturnFlag = CustomerInfoReturnFlag.RETURNED,
        encryptedFlg: string = "1",
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
                    token_key: { _text: token },
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
     *
     * @param customerId customerId of createUpdateCustomer or createUpdateCustomerWithToken
     * @param customerReturnFlg is required
     * @param responseInfoType is required
     * @param cardbrandReturnFlg is required
     * @param encryptedFlg is required
     * @param requestDate format is YYYYMMDDHHmmss
     * @returns
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
     *
     * @param customerId customerId from createUpdateCustomer or createUpdateCustomerWithToken
     * @param orderId is required
     * @param itemId is required
     * @param amount is required
     * @param customerReturnFlg is required
     * @param encryptedFlg is required
     * @param requestDate format is YYYYMMDDHHmmss
     * @param cardbrandReturnFlg is required
     * @returns
     */

    async createTransaction(
        customerId: string,
        orderId: string,
        itemId: string,
        amount: string,
        customerReturnFlg: CustomerInfoReturnFlag,
        encryptedFlg: EncryptedFlag = EncryptedFlag.NONE,
        requestDate: string,
        cardbrandReturnFlg: CardBrandReturnFlag = CardBrandReturnFlag.RETURNED
    ): Promise<SoftbankTransactionResponse> {
        const payload = {
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
                pay_method_info: {
                    cardbrand_return_flg: { _text: cardbrandReturnFlg },
                },
                sps_hashcode: {
                    _text: this.generateHashCode(
                        customerId,
                        orderId,
                        itemId,
                        amount,
                        customerReturnFlg,
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
     *
     * @param transactionId transactionId from createTransaction
     * @param trackingId trackingId from createTransaction
     * @param requestDate requestDate format YYYYMMDDHHmmss
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
     *
     * @param transactionId transactionId from createTransaction request
     * @param trackingId trackingId from createTransaction request
     * @param processDate processDate from createTransaction request
     * @param requestDate requestDate format YYYYMMDDHHmmss
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
     *
     * @param transactionId transactionId from createTransaction request
     * @param trackingId trackingId from createTransaction request
     * @param processDate processDate from createTransaction request
     * @param requestDate requestDate format YYYYMMDDHHmmss
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
