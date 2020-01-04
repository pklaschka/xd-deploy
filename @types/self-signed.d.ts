/*
 * Copyright (c) 2020. by Pablo Klaschka
 */

interface Attribute {
    name: string,
    value: string
}

interface SelfSignedOptions {
    /**
     * the size for the private key in bits (default: 1024)
     */
    keySize?: number;
    /**
     * how long till expiry of the signed certificate (default: 365)
     */
    days?: number;
    /**
     * sign the certificate with specified algorithm (default: 'sha1')
     */
    algorithm?: string;
    /**
     * certificate extensions array
     */
    extensions?: [{ name: 'basicConstraints', cA: true }];
    /**
     * include PKCS#7 as part of the output (default: false)
     */
    pkcs7?: boolean;
    /**
     * generate client cert signed by the original key (default: false)
     */
    clientCertificate?: boolean,
    /**
     * client certificate's common name (default: 'John Doe jdoe123')
     */
    clientCertificateCN?: 'jdoe'
}


interface Pems {
    private: string;
    public: string;
    cert: string;
    clientprivate?: string;
    clientpublic?: string;
    clientcert?: string;
}

declare module 'selfsigned' {
    /**
     * Generate a self signed x509 certificate from node.js.
     * @param attrs
     * @param options
     */
    function generate(attrs: Attribute[], options?: SelfSignedOptions): Pems;

    function generate(attrs: Attribute[], options: SelfSignedOptions, cb: (err: Error, pems: Pems) => void): void;
}

