import {
  type Hex,
  hashTypedData,
  parseSignature,
  serializeCompactSignature,
  signatureToCompactSignature,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import type { Signer, VowParams } from "./signer.interface.ts";

const VOW_DOMAIN = {} as const;

const VOW_TYPES = {
  Vow: [
    { name: "chainId", type: "uint256" },
    { name: "rootBlockNumber", type: "uint256" },
    { name: "root", type: "bytes32" },
  ],
} as const;

export function computeVowDigest(params: VowParams): Hex {
  return hashTypedData({
    domain: VOW_DOMAIN,
    types: VOW_TYPES,
    primaryType: "Vow",
    message: {
      chainId: params.chainId,
      rootBlockNumber: params.rootBlockNumber,
      root: params.root,
    },
  });
}

export function createEnvSigner(privateKeyHex: string): Signer {
  const withPrefix = privateKeyHex.startsWith("0x")
    ? (privateKeyHex as `0x${string}`)
    : (`0x${privateKeyHex}` as `0x${string}`);

  const account = privateKeyToAccount(withPrefix);

  return {
    async signVow(params: VowParams) {
      const signature = await account.signTypedData({
        domain: VOW_DOMAIN,
        types: VOW_TYPES,
        primaryType: "Vow",
        message: {
          chainId: params.chainId,
          rootBlockNumber: params.rootBlockNumber,
          root: params.root,
        },
      });
      return serializeCompactSignature(signatureToCompactSignature(parseSignature(signature)));
    },
    address() {
      return account.address;
    },
  };
}
