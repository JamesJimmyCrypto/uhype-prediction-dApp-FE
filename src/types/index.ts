import { BN } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

// Define the ConfigAccount type
export interface ConfigAccount {
  bump: number; // u8 as a number
  isInitialized: boolean;
  owner: PublicKey;
  serviceFeeAccount: PublicKey;
}

export type Answer = {
  answerKey: string;             // string
  name: string;                  // string
  answerTotalTokens: string;     // string
};
// Define the MarketAccount type
export type MarketAccount = {
  bump: number;                  // u8
  creator: PublicKey;            // publicKey
  marketKey: BN;                 // u64 (BN for large numbers)
  title: string;                 // string
  creatorFeePercentage: BN;      // u64 (BN for large numbers)
  serviceFeePercentage: BN;      // u64 (BN for large numbers)
  marketTotalTokens: BN;         // u64 (BN for large numbers)
  marketRemainTokens: BN;        // u64 (BN for large numbers)
  description: string;           // string
  correctAnswerKey: BN;          // u64 (BN for large numbers)
  isActive: boolean;             // bool
  coverUrl: string;              // string
};
export type Market = MarketAccount & {
  answers: Answer[];
};
// Define the MarketResponse type
export type MarketResponse = {
  publicKey: PublicKey;
  account: MarketAccount;
};

export type AnswerAccount = {
  bump: number;                   // u8
  answers: Answer[];              // vector of `Answer` type
  marketKey: BN;                  // u64 (BN for large numbers)
};


export type Dehype = {
  "version": "0.1.0",
  "name": "dehype",
  "instructions": [
    {
      "name": "createMarket",
      "accounts": [
        {
          "name": "market",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "eventName",
          "type": "string"
        },
        {
          "name": "outcomeOptions",
          "type": {
            "vec": "string"
          }
        }
      ]
    },
    {
      "name": "resolveMarket",
      "accounts": [
        {
          "name": "market",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "winningOutcome",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "market",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "eventName",
            "type": "string"
          },
          {
            "name": "outcomeTokens",
            "type": {
              "vec": {
                "defined": "OutcomeToken"
              }
            }
          },
          {
            "name": "isActive",
            "type": "bool"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "OutcomeState",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Pending"
          },
          {
            "name": "Winning"
          },
          {
            "name": "Losing"
          }
        ]
      }
    },
    {
      "name": "OutcomeToken",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "liquidity",
            "type": "u64"
          },
          {
            "name": "outcomeState",
            "type": {
              "defined": "OutcomeState"
            }
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "EventNameTooLong",
      "msg": "The event name is too long."
    },
    {
      "code": 6001,
      "name": "TooManyOutcomeOptions",
      "msg": "Too many outcome options."
    },
    {
      "code": 6002,
      "name": "OutcomeOptionNameTooLong",
      "msg": "An outcome option name is too long."
    },
    {
      "code": 6003,
      "name": "InvalidOutcome",
      "msg": "Invalid outcome."
    }
  ]
};

export const IDL: Dehype = {
  "version": "0.1.0",
  "name": "dehype",
  "instructions": [
    {
      "name": "createMarket",
      "accounts": [
        {
          "name": "market",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "eventName",
          "type": "string"
        },
        {
          "name": "outcomeOptions",
          "type": {
            "vec": "string"
          }
        }
      ]
    },
    {
      "name": "resolveMarket",
      "accounts": [
        {
          "name": "market",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "winningOutcome",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "market",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "eventName",
            "type": "string"
          },
          {
            "name": "outcomeTokens",
            "type": {
              "vec": {
                "defined": "OutcomeToken"
              }
            }
          },
          {
            "name": "isActive",
            "type": "bool"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "OutcomeState",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Pending"
          },
          {
            "name": "Winning"
          },
          {
            "name": "Losing"
          }
        ]
      }
    },
    {
      "name": "OutcomeToken",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "liquidity",
            "type": "u64"
          },
          {
            "name": "outcomeState",
            "type": {
              "defined": "OutcomeState"
            }
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "EventNameTooLong",
      "msg": "The event name is too long."
    },
    {
      "code": 6001,
      "name": "TooManyOutcomeOptions",
      "msg": "Too many outcome options."
    },
    {
      "code": 6002,
      "name": "OutcomeOptionNameTooLong",
      "msg": "An outcome option name is too long."
    },
    {
      "code": 6003,
      "name": "InvalidOutcome",
      "msg": "Invalid outcome."
    }
  ]
};

