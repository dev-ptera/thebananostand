### with ledger

# check usage instructions:

        npm start

        bananojs-hw
        #usage:
        https://github.com/BananoCoin/bananojs-hw/blob/master/docs/banano-cli.md

# check that the ledger device is not plugged in:

        npm start ledgerinfo

        bananojs-hw
        ledger info { pathCount: 0, found: false }

# check that the ledger app is plugged in but app is not open:

        npm start ledgerinfo

        bananojs-hw
        ledger info {
          pathCount: 1,
          found: true,
          supported: true,
          error: 'Ledger device: CLA_NOT_SUPPORTED (0x6e00)'
        }

# check that the ledger app is plugged in and app is open:

        npm start ledgerinfo

        bananojs-hw
        ledger info {
          pathCount: 1,
          found: true,
          supported: true,
          config: { version: '1.2.4', coinName: 'Banano' }
        }

# get the account for the private key:

        npm start blgetaccount ${accountIx}

        npm start blgetaccount 0

        bananojs
        banano getaccount publicKey ACA68A2D52FE17BAB36D48456569FE7F91F23CB57B971B13FAF236EBBCC7FA94
        banano getaccount account ban_3d78japo7ziqqcsptk47eonzwzwjyaydcywq5ebzowjpxgyehynnjc9pd5zj

# check pending using private key:

        npm start blcheckpending ${accountIx} ${maxAccountsPending}

        npm start blcheckpending 0 10

        bananojs
        banano checkpending response {
          blocks: {
            ban_3d78japo7ziqqcsptk47eonzwzwjyaydcywq5ebzowjpxgyehynnjc9pd5zj: {
              '48818DC7E09AA8EE12A62D23FBB4AD0D687087C8B3D2C5B5835951162D5DA615': '100000000000000000000000000000'
            }
          }
        }

# recieve pending using private key:

        npm start blreceive ${accountIx} ${hash}

        npm start blreceive 0 E6135B09A3DC34455D65E14B675ACE4DB87ED5B841FBCFA4234B09097F8ADD69

        bananojs
        banano receive response {
          pendingCount: 1,
          pendingBlocks: [
            'E6135B09A3DC34455D65E14B675ACE4DB87ED5B841FBCFA4234B09097F8ADD69'
          ],
          receiveCount: 1,
          receiveBlocks: [
            '6FAE6888AE03C6109A22BF973FB9C0D9684610835B50474712C4BC86A9FB636C'
          ],
          pendingMessage: 'pending 1 blocks, of max 10.',
          receiveMessage: 'received 1 blocks.'
        }

# convert amount to raw:

        npm start bamountraw 1

# send using private key:

        npm start blsendraw ${accountIx} ${destAccount} ${amountRaw}

        npm start blsendraw 0 ban_1coranoshiqdentfbwkfo7fxzgg1jhz6m33pt9aa8497xxfageuskroocdxa 100000000000000000000000000000

        bananojs
        banano sendbanano response BF3BA5C6F91D52E88658E6AB800237C4023AD59392B4AB203EBA1E5BF706E535

# check account info

        npm start baccountinfo ban_1coranoshiqdentfbwkfo7fxzgg1jhz6m33pt9aa8497xxfageuskroocdxa

        bananojs
        banano accountinfo response {
          frontier: '41E7FF66C785F3DE2F192BA05C8DEBDC2B33D89B85C5BB49B4F219C8112A5BC8',
          open_block: 'B6BD40F6F400BF0D81F2A28218039EBB1E6B9EE2764A0EFF344F7B9A123D5067',
          representative_block: '41E7FF66C785F3DE2F192BA05C8DEBDC2B33D89B85C5BB49B4F219C8112A5BC8',
          balance: '100000000000000000000000000000000000',
          modified_timestamp: '1604070386',
          block_count: '704',
          account_version: '0',
          confirmation_height: '704',
          representative: 'ban_1fomoz167m7o38gw4rzt7hz67oq6itejpt4yocrfywujbpatd711cjew8gjj',
          balanceParts: {
            majorName: 'banano',
            minorName: 'banoshi',
            banano: '1000000',
            banoshi: '0',
            raw: '0'
          },
          balanceDescription: '1,000,000 banano',
          balanceDecimal: '1000000.0000000000000000000000000000000'
        }
