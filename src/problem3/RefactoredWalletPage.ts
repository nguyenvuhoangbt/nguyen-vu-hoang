interface WalletBalance {
  blockchain: string
  currency: string
  amount: number
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string
}

const WalletPage: React.FC<BoxProps> = (props: BoxProps) => {
  const { children, ...rest } = props
  const balances = useWalletBalances()
  const prices = usePrices()

  const priorityMap: Record<string, number> = {
    Osmosis: 100,
    Ethereum: 50,
    Arbitrum: 30,
    Zilliqa: 20,
    Neo: 20,
  }

  const getPriority = (blockchain: string): number => {
    return priorityMap[blockchain] || -99
  }

  const sortedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const balancePriority = getPriority(balance.blockchain)
        return balancePriority > -99 && balance.amount > 0
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        const leftPriority = getPriority(lhs.blockchain)
        const rightPriority = getPriority(rhs.blockchain)
        return rightPriority - leftPriority // Descending order
      })
  }, [balances])

  const formattedBalances: FormattedWalletBalance[] = sortedBalances.map(
    (balance: WalletBalance) => ({
      ...balance,
      formatted: balance.amount.toFixed(),
    })
  )

  const rows = formattedBalances.map(
    (balance: FormattedWalletBalance, index: number) => {
      const usdValue = prices[balance.currency] * balance.amount
      return (
        <WalletRow
          className={classes.row}
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

export default WalletPage
