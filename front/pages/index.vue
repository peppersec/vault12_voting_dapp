<template>
  <div class="container">
    <section class="section future">
      <div class="columns is-vcentered mobile-reverse">
        <div class="column">
          <h1 class="title is-spaced">The Future of The Vault12 Platform</h1>
          <p>
            It has been well over a year since we published the Vault12 white paper and shared our
            vision of a distributed secretkeeping platform to secure our most valuable crypto assets
            and most critical documents. Security tokens were in their infancy, and there was little
            guidance on how security tokens could operate in distributed software platforms.
          </p>
          <b-button
            v-scroll-to="'.vote'"
            type="is-primary"
            size="is-medium"
            class="chevron"
            rounded
          >
            Place Vote Now
          </b-button>
        </div>
        <div class="column">
          <div class="voting">
            <div class="voting-header">
              Vault12 Voting
            </div>
            <div class="voting-line top"></div>
            <div class="voting-item">
              <div class="voting-label">
                Active ballot for:
              </div>
              <div class="voting-value">
                Future token structure
              </div>
            </div>
            <div class="voting-line bottom"></div>
            <div class="voting-item">
              <div class="voting-label">
                To sumbit votes:
              </div>
              <div class="voting-value">
                {{ `${duration.days}:${duration.hours}:${duration.minutes}:${duration.seconds}` }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="section vote">
      <div class="columns">
        <div class="column">
          <div class="vote-icon">
            <img
              src="~/assets/img/vote-no-change.png"
              srcset="~/assets/img/vote-no-change@2x.png 2x, ~/assets/img/vote-no-change@3x.png 3x"
              alt=""
            />
          </div>
          <h4>
            No Change
          </h4>
          <p>
            This vote means the community prefers to keep VGT token to the exact policy described in
            our white paper
          </p>
          <b-button
            v-if="canVote"
            type="is-primary"
            size="is-medium"
            class="chevron"
            :disabled="isError"
            rounded
            @click="vote({ votingOption: 1 })"
          >
            Vote for “No Change”
          </b-button>
          <a v-scroll-to="'.no-change'" href="#" class="link">Read more</a>
        </div>
        <div class="column">
          <div class="vote-icon">
            <img src="~/assets/img/vote-dual-token.svg" alt="" />
          </div>
          <h4>
            Dual Token
          </h4>
          <p>
            This proposal constructs a new token specifically designed and categorized as a utility
            token and would
          </p>
          <b-button
            v-if="canVote"
            type="is-primary"
            size="is-medium"
            class="chevron"
            :disabled="isError"
            rounded
            @click="vote({ votingOption: 2 })"
          >
            Vote for “Dual Token”
          </b-button>
          <a v-scroll-to="'.structure'" href="#" class="link">Read more</a>
        </div>
        <div class="column">
          <div class="vote-icon">
            <img src="~/assets/img/vote-transaction-split.svg" alt="" />
          </div>
          <h4>
            Transaction Split
          </h4>
          <p>
            This proposal leverages the security basis of the VGT token, and switches its function
            from application currency
          </p>
          <b-button
            v-if="canVote"
            type="is-primary"
            size="is-medium"
            class="chevron"
            :disabled="isError"
            rounded
            @click="vote({ votingOption: 3 })"
          >
            Vote for “Transaction Split”
          </b-button>
          <a v-scroll-to="'.split'" href="#" class="link">Read more</a>
        </div>
      </div>

      <div v-if="voteTx.txHash && voteTx.status !== 1" class="token-field">
        <div class="label">Transaction hash</div>
        <div class="txs">
          <div class="txs__item" :class="txStatusClass(voteTx.status)">
            <div class="txs__status"></div>
            <a :href="txExplorerUrl('voteTx')" class="txs__address" target="_blank">
              {{ txHashToRender('voteTx') }}
            </a>
          </div>
        </div>
      </div>
    </section>
    <section class="section results">
      <Results :chart-data="votingResults.data" :total-voted="votingResults.totalVoted" />
    </section>
    <section v-if="ethAccount" class="section wallet">
      <div class="columns is-gapless">
        <div class="column left-column">
          <div class="border left-border">
            <div class="logo">
              <img src="~/assets/img/logo-blue.svg" alt="" />
            </div>
          </div>
        </div>
        <div class="column right-column">
          <div class="border right-border">
            <div v-if="ethAccount" class="wallet-item">
              <div class="wallet-item__name">Your Address</div>
              <div class="wallet-item__value">{{ ethAccount }}</div>
            </div>
            <div class="columns is-gapless">
              <div class="column">
                <div class="wallet-item">
                  <div class="wallet-item__name">
                    Your Voting Power at {{ networkConfig.snapshotBlock }} block number
                  </div>
                  <div class="wallet-item__value">{{ balance }} <span>VGT</span></div>
                </div>
              </div>
              <div class="column">
                <div class="wallet-item">
                  <div class="wallet-item__name">Your Decision</div>
                  <a class="wallet-item__value" :href="txExplorerUrl('voteTx')" target="_blank">
                    {{ decision }}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <b-message type="is-warning" :active.sync="isError">
      {{ errorMessage }}
    </b-message>
    <section class="section no-change">
      <div class="columns is-vcentered">
        <div class="column">
          <img
            src="~/assets/img/no-change.png"
            srcset="~/assets/img/no-change@2x.png 2x, ~/assets/img/no-change@3x.png 3x"
            alt=""
          />
        </div>
        <div class="column">
          <h2 class="title">
            No change
          </h2>
          <h3 class="subtitle">
            This vote means the community prefers to keep VGT tokens to the exact policy described in
            our white paper.
          </h3>
          <p>
            International customers will be able to buy/sell tokens with minimal complications, yet in the US sales of VGT Tokens will be restricted to US-accredited investors only (same as the STO). 
            The VGT tokens will only be listed on security-token compliant exchanges. In practice, this means the exclusion of the US market from Vault12 products powered by the VGT token.
          </p>
        </div>
      </div>
    </section>
    <section class="section structure">
      <div class="columns is-vcentered mobile-reverse">
        <div class="column">
          <h2 class="title">
            Dual Token Structure
          </h2>
          <h3 class="subtitle">
            Make distribution of application tokens as easy as possible
          </h3>
          <p>
            Providing end users with tokens will be heavily restricted as long as tokens remain
            categorized as a security. The task of categorizing VGT as a utility might take years and
            may depend on regulations that are not yet issued.
          </p>
          <p>
            Instead, we can cleanly separate the role of the token as a fundraising instrument (an
            activity which is now in the past and completed via the original VGT token) and create a
            utility token as an application resource bought by users to access the platform. VGT
            will remain the original security token that will keep all original functions. VGT will
            get one new additional function: it can be used for one-way burn into VGU: Vault
            Guardian Utility token. VGU can be created by one and only one method: A one-way burn of
            one VGT token into one VGU token.
          </p>
        </div>
        <div class="column">
          <img
            src="~/assets/img/dual-token-structure.png"
            srcset="
              ~/assets/img/dual-token-structure@2x.png 2x,
              ~/assets/img/dual-token-structure@3x.png 3x
            "
            alt=""
          />
        </div>
      </div>
      <div class="pattern"></div>
      <div class="v-table">
        <div class="v-table__item v-table__item--header">
          <div class="v-table__cell v-table__cell--vgt v-table__cell--header">
            VGT Security
          </div>
          <div class="v-table__cell v-table__cell--vgu v-table__cell--header">
            VGU Utility
          </div>
        </div>
        <div v-for="(item, index) in dualTokenTable" :key="index" class="v-table__item">
          <div class="v-table__cell v-table__cell--vgt">
            <div class="v-table__help-name">VGT Security</div>
            {{ item.vgt }}
          </div>
          <div class="v-table__cell v-table__cell--vgu">
            <div class="v-table__help-name">VGU Utility</div>
            {{ item.vgu }}
          </div>
        </div>
      </div>
    </section>
    <section class="section split">
      <div class="columns is-vcentered">
        <div class="column">
          <img
            src="~/assets/img/transaction-split.png"
            srcset="
              ~/assets/img/transaction-split@2x.png 2x,
              ~/assets/img/transaction-split@3x.png 3x
            "
            alt=""
          />
        </div>
        <div class="column">
          <h2 class="title">
            Transaction Split
          </h2>
          <h3 class="subtitle">
            Make ease of use of the application as simple as possible
          </h3>
          <p>
            The Dual token approach solves the issue of wide distribution of our token on utility
            exchanges but introduces an extra layer of complexity for the application usage. Now
            users need to understand the concept of two separate yet related tokens and figure out
            the correct exchange to buy the correct token they need for actual usage. That level of
            complexity might be too hard for the average user and might lead to decreased adoption
            of the product.
          </p>
          <p>
            Instead, we can make the platform accept widely available Ethereum (and other
            cryptocurrencies at a later date) and keep the original VGT token as registration of
            commercial rights on the platform. This way millions of Ethereum users can immediately
            use the Vault12 platform with no extra steps such as buying tokens on exchanges. At the same
            time, VGT tokens become valuable since ownership entitles holders to automatically
            receive a piece of each transaction that takes place on the platform.
          </p>
          <p>
            As you might recall from our white paper, the Vault12 platform will be powered by following
            three transaction groups:
          </p>
        </div>
      </div>
      <div class="pattern"></div>
      <div class="v-table">
        <div class="v-table__item v-table__item--header">
          <div class="v-table__cell v-table__cell--split v-table__cell--header">
            Type
          </div>
          <div class="v-table__cell v-table__cell--split v-table__cell--header">
            Sender
          </div>
          <div class="v-table__cell v-table__cell--split v-table__cell--header">
            Recipient
          </div>
          <div class="v-table__cell v-table__cell--split v-table__cell--header">
            Time
          </div>
        </div>
        <div v-for="(item, index) in transactionSplitTable" :key="index" class="v-table__item">
          <div class="v-table__cell v-table__cell--split">
            <div class="v-table__help-name">Type</div>
            {{ item.type }}
          </div>
          <div class="v-table__cell v-table__cell--split">
            <div class="v-table__help-name">Sender</div>
            {{ item.sender }}
          </div>
          <div class="v-table__cell v-table__cell--split">
            <div class="v-table__help-name">Recipient</div>
            {{ item.recipient }}
          </div>
          <div class="v-table__cell v-table__cell--split">
            <div class="v-table__help-name">Time</div>
            {{ item.time }}
          </div>
        </div>
      </div>
      <div class="columns">
        <div class="column">
          <p>Here are the main consequences of this policy:</p>
          <ul>
            <li>Any Ethereum owner will be able to use the Vault12 application immediately.</li>
            <li>
              Ownership of VGT tokens will become an instrument to receive a steady flow of Ethereum
              (and at later date, potentially, other compatible cryptocurrencies) proportional to
              the transaction volume taking place on the platform.
            </li>
            <li>
              At the moment, external owners control ~82% of all unlocked VGT tokens and
              therefore will receive 82% of the ETH balance received in transaction splits.
            </li>
            <li>
              VGT tokens will be tradable only on security exchanges. US residents who wish to buy
              VGT tokens will have to remain compliant with KYC/accreditation regulations.
            </li>
          </ul>
        </div>
        <div class="column">
          <scheme />
        </div>
      </div>
    </section>
  </div>
</template>
<script>
/* eslint-disable no-console */
import { mapActions, mapState, mapGetters } from 'vuex'
import Scheme from '../components/Scheme'
import Results from '../components/Results'

export default {
  name: 'Voting',
  components: {
    Scheme,
    Results
  },
  data() {
    return {
      dualTokenTable: [
        {
          vgt: 'Created and distributed by Vault12',
          vgu:
            'Created by VGT owners via one-way burn. Only existing owners of VGT can create VGU tokens'
        },
        {
          vgt: 'Used by company for fundraising',
          vgu:
            'Not offered by Company for sale and not used by the Company for fundraising. Only VGT investors can convert some of their VGT tokens into VGU and subsequently put VGU on the exchanges. Company is not offering VGU for sale, nor profits from VGU sales by investors'
        },
        {
          vgt: 'Can be used as investment instrument, unlimited buy/sell capability',
          vgu:
            'Can only be created & transferred in amounts equal to average user application budget for one year of use, estimated to be around ~$500. VGU creation contract will allow up to fixed, small limit of VGU to be issued or transferred per one address'
        },
        {
          vgt:
            'Can be bought/traded only on security token exchanges for qualified accredited or international investors',
          vgu: 'Can be bought by any user or any utility exchange.'
        },
        {
          vgt: 'Thousands of potential US owners. Millions of potential international owners',
          vgu: 'Millions of potential owners in the US. Millions of potential international owners'
        },
        {
          vgt: 'Can be used in Vault12 app',
          vgu: 'Can be used in Vault12 app'
        },
        {
          vgt: 'Held by investors until all tokens are converted to VGU over the years',
          vgu: 'Permanent operational currency of the platform'
        }
      ],
      transactionSplitTable: [
        {
          type: 'Guardian service contracts',
          sender: 'Vault Owner',
          recipient: 'Guardian group',
          time: 'Vault creation'
        },
        {
          type: 'Relay fees',
          sender: 'Vault Owner',
          recipient: 'Commercial relay owner',
          time: 'Relay upload session'
        },
        {
          type: 'Vault fees',
          sender: 'Vault Owner',
          recipient: 'Vaiult12, Inc.',
          time: 'Monthly Vault fee for premium Vaults'
        }
      ]
    }
  },
  computed: {
    ...mapState('voting', ['voteTx', 'decision', 'duration', 'votingResults']),
    ...mapGetters('voting', [
      'txExplorerUrl',
      'txHashToRender',
      'txStatusClass',
      'isUserInVotingList',
      'balance'
    ]),
    ...mapState('metamask', ['ethAccount']),
    ...mapGetters('metamask', ['networkConfig']),
    isError() {
      return !this.isUserInVotingList
    },
    errorMessage() {
      if (this.ethAccount) {
        return `Current address ${this.ethAccount} is not in the V12 voting list.`
      }
      return `Please install metamask or use TrustWallet`
    },
    canVote() {
      return this.ethAccount && this.isUserInVotingList && this.decision === 'Not Voted'
    }
  },
  methods: {
    ...mapActions('voting', ['vote'])
  }
}
</script>
