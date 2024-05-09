import React, { useEffect, useState } from 'react'
import Select, { SingleValue } from 'react-select'
import SyncAltIcon from '@mui/icons-material/SyncAlt'
import {
  FormControl,
  TextField,
  IconButton,
  Backdrop,
  CircularProgress,
} from '@mui/material'
import {
  getUniqueCurrencySymbols,
  getConvertRate,
} from '../composables/ccxt.ts'
import { grey } from '@mui/material/colors'
import { useDebounce } from 'use-debounce'
import { toFixedIfNecessary } from '../composables/helper.ts'

type CurrencyOption = { value: string; label: string }

const initialForm = {
  fromToken: '',
  toToken: '',
  fromAmount: 0,
  toAmount: 0,
}

const MAX_DECIMAL = 8

const Form = () => {
  const [form, setForm] = useState(initialForm)
  const [debouncedValue] = useDebounce(form, 1000)
  const [listCurrency, setListCurrency] = useState<CurrencyOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [rate, setRate] = useState<number | null | undefined>(undefined)

  useEffect(() => {
    const fetchData = async () => {
      const data = await getUniqueCurrencySymbols()
      if (data) {
        const formattedData = data.map((e: string) => ({
          value: e,
          label: e,
        }))
        setListCurrency(formattedData)
      }
    }
    fetchData()
  }, [])

  const handleGetConvertRate = async (fromToken: string, toToken: string) => {
    setIsLoading(true)
    const rate = await getConvertRate(fromToken, toToken)
    setRate(rate ? toFixedIfNecessary(rate, MAX_DECIMAL) : null)
    setIsLoading(false)
    return rate
  }

  useEffect(() => {
    if (!debouncedValue.fromToken || !debouncedValue.toToken) return

    if (
      (debouncedValue.fromAmount && !debouncedValue.toAmount) ||
      (debouncedValue.fromAmount && debouncedValue.toAmount)
    ) {
      handleGetConvertRate(
        debouncedValue.fromToken,
        debouncedValue.toToken
      ).then((result) => {
        const fixedResult = toFixedIfNecessary(
          Number(result) * form.fromAmount,
          MAX_DECIMAL
        )
        setForm((prevState) => ({
          ...prevState,
          toAmount: fixedResult,
        }))
      })
      return
    }

    if (!debouncedValue.fromAmount && debouncedValue.toAmount) {
      handleGetConvertRate(
        debouncedValue.toToken,
        debouncedValue.fromToken
      ).then((result) => {
        const fixedResult = toFixedIfNecessary(
          Number(result) * form.toAmount,
          MAX_DECIMAL
        )
        setForm((prevState) => ({
          ...prevState,
          fromAmount: fixedResult,
        }))
      })
      return
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue.fromToken, debouncedValue.toToken])

  useEffect(() => {
    if (!debouncedValue.fromAmount) {
      setForm((prevState) => ({
        ...prevState,
        toAmount: 0,
      }))
      return
    }
    if (debouncedValue.toToken) {
      if (debouncedValue.fromToken === debouncedValue.toToken) {
        setForm((prevState) => ({
          ...prevState,
          toAmount: form.fromAmount,
        }))
        setRate(1)
        return
      }

      handleGetConvertRate(form.fromToken, form.toToken).then((result) => {
        const fixedResult = toFixedIfNecessary(
          Number(result) * form.fromAmount,
          MAX_DECIMAL
        )
        setForm((prevState) => ({
          ...prevState,
          toAmount: fixedResult,
        }))
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue.fromAmount])

  useEffect(() => {
    if (!debouncedValue.toAmount) {
      setForm((prevState) => ({
        ...prevState,
        fromAmount: 0,
      }))
      return
    }
    if (debouncedValue.fromToken) {
      if (debouncedValue.fromToken === debouncedValue.toToken) {
        setForm((prevState) => ({
          ...prevState,
          fromAmount: form.toAmount,
        }))
        return
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue.toAmount])

  const handleSwapCurrency = () => {
    if (!form.fromToken && !form.toToken) return
    const fromToken = form.fromToken
    const toToken = form.toToken
    setForm({
      ...form,
      fromAmount: 1,
      fromToken: toToken,
      toToken: fromToken,
    })
  }

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target
    setForm((prevState) => ({
      ...prevState,
      [name]: value.substring(0, 15),
    }))
  }

  const handleCurrencyChange = (
    value: SingleValue<CurrencyOption>,
    field: string
  ) => {
    setForm((prevState) => ({
      ...prevState,
      [field]: value ? value.value : null,
    }))
  }

  return (
    <form className='bg-[#ffffff80] rounded-lg border-2 border-[#d1d5db4d] p-8 flex flex-col md:w-1/2 mx-4 min-w-[300px] md:max-w-[600px]'>
      <FormControl variant='filled' fullWidth className='flex flex-col gap-8'>
        <div className='flex gap-4 md:flex-row flex-col'>
          <Select
            className='basic-single flex-[1.5]'
            classNamePrefix='select'
            placeholder='From Token'
            isSearchable
            isLoading={!listCurrency.length}
            isDisabled={!listCurrency.length}
            onChange={(value) => handleCurrencyChange(value, 'fromToken')}
            value={listCurrency.find((item) => item.value === form.fromToken)}
            options={listCurrency}
            styles={{
              control: (
                { borderColor, boxShadow, ...provided },
                { theme }
              ) => ({
                ...provided,
                height: '56px',
                fontWeight: 700,
                borderColor: theme.colors.neutral20,
                '&:hover': {
                  borderColor: theme.colors.neutral30,
                },
              }),
            }}
            maxMenuHeight={190}
          />
          <TextField
            className='flex-1'
            type='number'
            variant='outlined'
            disabled={!form.fromToken}
            value={form.fromAmount}
            error={Number(form.fromAmount) < 0}
            helperText={Number(form.fromAmount) < 0 ? 'Invalid input' : ''}
            inputProps={{
              style: {
                background: !form.fromToken ? grey[500] : '',
                fontWeight: 600,
              },
            }}
            onChange={(event) => {
              handleInputChange(event)
            }}
            onKeyDown={(evt) =>
              ['e', 'E', '+', '-'].includes(evt.key) && evt.preventDefault()
            }
            name='fromAmount'
          />
        </div>

        <IconButton
          size='large'
          className='w-fit mx-auto duration-500 bg-zinc-400 hover:bg-gray-400'
          onClick={handleSwapCurrency}
        >
          <SyncAltIcon
            className='text-4xl transform rotate-90 scale-x-[-1]'
            style={{ color: 'white' }}
          />
        </IconButton>

        <div className='flex gap-4 md:flex-row flex-col'>
          <Select
            className='basic-single flex-[1.5]'
            classNamePrefix='select'
            placeholder='To Token'
            isSearchable
            isLoading={!listCurrency.length}
            isDisabled={!listCurrency.length}
            onChange={(value) => handleCurrencyChange(value, 'toToken')}
            value={listCurrency.find((item) => item.value === form.toToken)}
            options={listCurrency}
            styles={{
              control: (
                { borderColor, boxShadow, ...provided },
                { theme }
              ) => ({
                ...provided,
                height: '56px',
                fontWeight: 700,
                borderColor: theme.colors.neutral20,
                '&:hover': {
                  borderColor: theme.colors.neutral30,
                },
              }),
            }}
            maxMenuHeight={190}
          />
          <TextField
            className='flex-1'
            type='number'
            variant='outlined'
            InputProps={{
              readOnly: true,
            }}
            disabled
            value={form.toAmount}
            error={rate === null}
            helperText={
              rate === null
                ? 'Cannot access value of this token. Please try again later.'
                : ''
            }
            inputProps={{
              style: {
                fontWeight: 600,
              },
            }}
            onChange={handleInputChange}
            name='toAmount'
            FormHelperTextProps={{
              style: { position: 'absolute', bottom: '-45px', margin: 0 },
            }}
          />
        </div>

        <div
          className={
            !rate || isLoading
              ? 'invisible'
              : 'text-center font-semibold text-md text-gray-600'
          }
        >
          {`1 ${debouncedValue.fromToken} = ${rate} ${debouncedValue.toToken}`}
        </div>
      </FormControl>

      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoading}
      >
        <CircularProgress color='inherit' />
      </Backdrop>
    </form>
  )
}

export default Form
