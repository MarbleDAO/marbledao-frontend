import React, { useEffect, useReducer } from 'react'
//import styled from 'styled-components'
import { styled } from 'components/theme'
import { TransferDialog } from '../../features/assets/components/TransferDialog'
import { useConnectIBCWallet } from '../../hooks/useConnectIBCWallet'
import { toast } from 'react-toastify'
import { AppLayout } from '../../components/Layout/AppLayout'
import { PageHeader } from '../../components/Layout/PageHeader'
import { AssetsList } from '../../features/assets/components/AssetsList'
import { Text } from '../../components/Text'
import { useConnectWallet } from '../../hooks/useConnectWallet'
import { useRecoilValue } from 'recoil'
import { walletState, WalletStatusType } from '../../state/atoms/walletAtoms'

export default function Transfer() {
  const [
    { transactionKind, isTransferDialogShowing, selectedToken },
    updateState,
  ] = useReducer((store, updatedStore) => ({ ...store, ...updatedStore }), {
    transactionKind: 'deposit',
    isTransferDialogShowing: false,
    selectedToken: null,
  })

  function handleAssetCardActionClick({ actionType, tokenSymbol }) {
    updateState({
      transactionKind: actionType,
      selectedToken: tokenSymbol,
      isTransferDialogShowing: true,
    })
  }

  function handleTransferDialogClose() {
    updateState({ isTransferDialogShowing: false })
  }

  const { mutate: connectExternalWallet } = useConnectIBCWallet(selectedToken, {
    onError(error) {
      toast.error(
        `Couldn't connect to your wallet to retrieve the address for ${selectedToken}: ${error}`,
        {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        }
      )
    },
  })

  const { mutate: connectInternalWallet } = useConnectWallet({
    onError(error) {
      toast.error(`Couldn't connect to your wallet: ${error}`, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
    },
  })

  const { status } = useRecoilValue(walletState)
  useEffect(() => {
    async function connectInternalAndExternalWallets() {
      if (status !== WalletStatusType.connected) {
        console.log('going to connect internal wallet first')
        await connectInternalWallet(null)
      }

      connectExternalWallet(null)
    }

    // connect wallet as soon as a token is selected
    if (selectedToken) {
      connectInternalAndExternalWallets()
    }
  }, [connectExternalWallet, connectInternalWallet, selectedToken, status])

  return (
    <>
      <AppLayout>
        <Container className="middle mauto">
          <StyledWrapper>
            <PageHeader
              title="IBC Transfer"
              subtitle="Easily and quickly initiate payments across IBC."
            />
            <StyledDivForWrapper>
              <AssetsList onActionClick={handleAssetCardActionClick} />
              <Text
                variant="body"
                color="tertiary"
                css={{ paddingTop: '$12', fontSize: '$14' }}
              >
                More tokens available soon
              </Text>
            </StyledDivForWrapper>
          </StyledWrapper>
        </Container>
      </AppLayout>
      {selectedToken && (
        <TransferDialog
          tokenSymbol={selectedToken}
          transactionKind={transactionKind}
          isShowing={isTransferDialogShowing}
          onRequestClose={handleTransferDialogClose}
        />
      )}
    </>
  )
}
const StyledWrapper = styled('section', {})
const Container = styled('div', {})
const StyledDivForWrapper = styled('div', {
  borderRadius: '$radii$4',
  border: '1px solid $borderColors$default',
  boxShadow: '0px 4px 24px $borderColors$shadow',
  padding: '3rem 4rem',
})
