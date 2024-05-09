interface WalletBalance {
  currency: string
  amount: number
}

// `FormattedWalletBalance` can extends from `WalletBalance`
interface FormattedWalletBalance {
  currency: string
  amount: number
  formatted: string
}

interface Props extends BoxProps {} // Unused Props Interface, can be replaced with `BoxProps` in below

const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props
  const balances = useWalletBalances()
  const prices = usePrices()

  const getPriority = (blockchain: any): number => {
    // can declare constant for type of blockchain to avoid using magic numbers
    switch (blockchain) {
      case 'Osmosis':
        return 100
      case 'Ethereum':
        return 50
      case 'Arbitrum':
        return 30
      case 'Zilliqa':
        return 20
      case 'Neo':
        return 20
      default:
        return -99
    }
  }

  const sortedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const balancePriority = getPriority(balance.blockchain) // Property 'blockchain' does not exist on type 'WalletBalance'
        // `lhsPriority` not be declared before, assume this could be `balancePriority`
        if (lhsPriority > -99) {
          if (balance.amount <= 0) {
            return true
          }
        }
        return false
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        const leftPriority = getPriority(lhs.blockchain)
        const rightPriority = getPriority(rhs.blockchain)

        // case leftPriority = rightPriority will be missed
        if (leftPriority > rightPriority) {
          return -1
        } else if (rightPriority > leftPriority) {
          return 1
        }
      })
  }, [balances, prices]) // this hook does not use `prices` to calculate, the hook will not update when `prices` changes,

  // `formattedBalances` is declared but its value is never read
  // Assuming `formattedBalances` will be use for `rows` below
  const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
    return {
      ...balance,
      formatted: balance.amount.toFixed(),
    }
  })

  const rows = sortedBalances.map(
    (balance: FormattedWalletBalance, index: number) => {
      const usdValue = prices[balance.currency] * balance.amount
      return (
        <WalletRow
          className={classes.row} // Assuming classes.row is defined in somewhere
          key={index}
          amount={balance.amount}
          usdValue={usdValue}
          formattedAmount={balance.formatted}
        />
      )
    }
  )

  return <div {...rest}>{rows}</div>
}
