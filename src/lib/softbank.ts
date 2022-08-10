import { sha1 } from "./../utils/index";
import axios from "axios";
import { xml2json, json2xml } from "xml-js";
import * as en from "../constants/errors/en";
import * as ja from "../constants/errors/ja";

/**
 * @interface XMLFieldData
 * @property {string} _text - XML value
 */
export interface XMLFieldData {
    _text: string;
}

/**
 * @interface SoftbankResponse
 * @property {XMLFieldData} [res_result]
 * @property {XMLFieldData} [res_code]
 * @property {XMLFieldData} [res_message]
 * @property {XMLFieldData} [error_message]
 */
export interface SoftbankResponse {
    res_result: XMLFieldData;
    res_err_code: XMLFieldData;
    res_date: XMLFieldData;
    error_message?: string;
}

const configLocale: any = {
    en: en,
    ja: ja,
};

/**
 * @enum {string}
 * @property {string} EN - en
 * @property {string} JA - ja
 */
export enum Locale {
    EN = "en",
    JA = "ja",
}

/**
 * @constructor
 * @param {string} endpoint Softbank API endpoint
 * @param {string} merchantId Softbank API merchant ID
 * @param {string} serviceId Softbank API service ID
 * @param {string} hashKey Softbank API hash key
 * @param {string} locale Softbank API locale
 */
export class SoftbankService {
    public endpoint: string;
    public merchantId: string;
    public serviceId: string;
    public hashKey: string;
    public locale: Locale;
    public requestId = {
        CREATE_CUSTOMER_REQUEST: "MG02-00101-101",
        UPDATE_CUSTOMER_REQUEST: "MG02-00102-101",
        CREATE_CUSTOMER_TOKEN_REQUEST: "MG02-00131-101",
        UPDATE_CUSTOMER_TOKEN_REQUEST: "MG02-00132-101",
        DELETE_CUSTOMER_REQUEST: "MG02-00103-101",
        GET_CUSTOMER_REQUEST: "MG02-00104-101",
        CREATE_TRANSACTION_REQUEST: "ST01-00131-101",
        CONFIRM_TRANSACTION_REQUEST: "ST02-00101-101",
        PURCHASE_REQUEST: "ST02-00201-101",
        REFUND_REQUEST: "ST02-00303-101",
    };
    constructor(
        endpoint: string,
        merchantId: string,
        serviceId: string,
        hashKey: string,
        locale: Locale = Locale.EN
    ) {
        this.endpoint = endpoint;
        this.merchantId = merchantId;
        this.hashKey = hashKey;
        this.serviceId = serviceId;
        this.locale = locale;
    }

    /**
     * @function generateHashCode
     * @memberof SoftbankService
     * @param {string[]} args
     * @returns string
     */
    public generateHashCode(...args: string[]): string {
        return sha1(
            `${this.merchantId}${this.serviceId}${args.join("")}${this.hashKey}`
        );
    }

    private parseMessageError(errorCode: string) {
        const paymentMethodErrCode = errorCode.slice(0, 3);
        const paymentTypeErrCode = errorCode.slice(3, 5);
        const paymentItemErrCode = errorCode.slice(5, 9);

        const paymentMethodErr =
            configLocale[this.locale].paymentMethod[paymentMethodErrCode] ||
            "Undefined";
        let paymentTypeErr = "Undefined";
        let paymentItemErr = "Undefined";

        if (configLocale[this.locale].paymentTypeError[paymentMethodErrCode]) {
            paymentTypeErr =
                configLocale[this.locale].paymentTypeError[
                    paymentMethodErrCode
                ][paymentTypeErrCode] || "Undefined";
        }

        if (configLocale[this.locale].paymentItemError[paymentItemErrCode]) {
            paymentItemErr =
                configLocale[this.locale].paymentItemError[
                    paymentItemErrCode
                ] || "Undefined";
        } else if (
            configLocale[this.locale].paymentItemError[paymentMethodErrCode]
        ) {
            paymentItemErr =
                configLocale[this.locale].paymentItemError[
                    paymentMethodErrCode
                ][paymentItemErrCode] || "Undefined";
        }

        return `${paymentMethodErr} ${paymentTypeErr} ${paymentItemErr}`;
    }

    public async request(data: any): Promise<any> {
        try {
            const result = await axios.post(
                this.endpoint,
                json2xml(JSON.stringify(data), { compact: true }),
                {
                    auth: {
                        username: this.merchantId + this.serviceId,
                        password: this.hashKey,
                    },
                    headers: {
                        "Content-Type": "application/xml",
                    },
                }
            );

            const parseDataString = xml2json(result.data, { compact: true });
            const parseData = JSON.parse(parseDataString || "{}");

            if (!parseData["sps-api-response"]) {
                throw new Error("No response from Softbank API");
            }

            if (parseData["sps-api-response"].res_result._text === "NG") {
                return {
                    ...parseData["sps-api-response"],
                    error_message: this.parseMessageError(
                        parseData["sps-api-response"].res_err_code._text
                    ),
                };
            }
            return parseData["sps-api-response"];
        } catch (error) {
            return {
                res_result: {
                    _text: "NG",
                },
                res_err_code: {
                    _text: "0000000",
                },
                error_message: this.parseMessageError("0000000"),
            };
        }
    }
}
