import React, { Component } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  SafeAreaView
} from 'react-native'
import { observer } from 'mobx-react/native'
import NavigationHeader from '../../../components/elements/NavigationHeader'
import InputWithAction from '../../../components/elements/InputWithActionItem'
import ActionButton from '../../../components/elements/ActionButton'
import Spinner from '../../../components/elements/Spinner'
import commonStyle from '../../../commons/commonStyles'
import BottomButton from '../../../components/elements/BottomButton'
import LayoutUtils from '../../../commons/LayoutUtils'
import NavStore from '../../../AppStores/NavStore'
import Checker from '../../../Handler/Checker'
import images from '../../../commons/images'
import AppStyle from '../../../commons/AppStyle'
import constant from '../../../commons/constant'
import ImportAddressStore from '../stores/ImportAddressStore'
import KeyboardView from '../../../components/elements/KeyboardView'
import TouchOutSideDismissKeyboard from '../../../components/elements/TouchOutSideDismissKeyboard'

const { width } = Dimensions.get('window')
const marginTop = LayoutUtils.getExtraTop()

@observer
export default class ImportViaAddressScreen extends Component {
  constructor(props) {
    super(props)
    this.extraHeight = new Animated.Value(0)
    this.importAddressStore = new ImportAddressStore()
  }

  onChangeName = (text) => {
    this.importAddressStore.setTitle(text)
  }

  onChangeAddress = (text) => {
    this.importAddressStore.setAddress(text)
    const { errorAddress } = this.importAddressStore
    if (errorAddress) {
      this.addressField.shake()
    }
  }

  onFocusName = () => this.importAddressStore.setFocusField('name')
  onFocusAddress = () => this.importAddressStore.setFocusField('address')
  onBlurTextField = () => this.importAddressStore.setFocusField('')

  gotoScan = () => {
    setTimeout(() => {
      NavStore.pushToScreen('ScanQRCodeScreen', {
        title: 'Scan Address',
        marginTop,
        returnData: this.returnData.bind(this)
      })
    }, 300)
  }

  goBack = () => {
    NavStore.goBack()
  }

  validateImport() {
    const { address } = this.importAddressStore
    if (address === '') {
      NavStore.popupCustom.show('Address cannot be empty')
      return false
    }
    if (!Checker.checkAddress(address) || Checker.checkAddress(address).length === 0) {
      NavStore.popupCustom.show('Invalid Address')
      return false
    }
    return true
  }

  returnData(codeScanned) {
    let address = codeScanned
    if (this.importAddressStore.title === '') {
      setTimeout(() => this.nameField.focus(), 250)
    }
    const resChecker = Checker.checkAddressQR(codeScanned)
    if (resChecker && resChecker.length > 0) {
      [address] = resChecker
    }
    this.importAddressStore.setAddress(address)
  }

  handleCreate = () => {
    const { title } = this.importAddressStore
    const validate = this.validateImport()
    if (!validate) {
      return
    }
    this.importAddressStore.create(title)
  }

  render() {
    const {
      address, title, loading, isErrorTitle, errorAddress, isReadyCreate, isNameFocus, isAddressFocus
    } = this.importAddressStore
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <TouchOutSideDismissKeyboard >
          <View style={styles.container}>
            <KeyboardView style={styles.container} >
              <NavigationHeader
                style={{ marginTop: marginTop + 20, width }}
                headerItem={{
                  title: 'Add Address',
                  icon: null,
                  button: images.backButton
                }}
                action={this.goBack}
              />
              <Text style={[styles.titleText, { marginTop: 15, color: isNameFocus ? AppStyle.mainColor : AppStyle.secondaryTextColor }]}>Name</Text>
              <InputWithAction
                ref={(ref) => { this.nameField = ref }}
                style={{ width: width - 40, marginTop: 10 }}
                value={title}
                onFocus={this.onFocusName}
                onBlur={this.onBlurTextField}
                onChangeText={this.onChangeName}
              />
              {isErrorTitle &&
                <Text style={styles.errorText}>{constant.EXISTED_NAME}</Text>
              }
              <Text style={[styles.titleText, { marginTop: 20, color: isAddressFocus ? AppStyle.mainColor : AppStyle.secondaryTextColor }]}>Address</Text>
              <InputWithAction
                ref={(ref) => { this.addressField = ref }}
                style={{ width: width - 40, marginTop: 10 }}
                onChangeText={this.onChangeAddress}
                needPasteButton
                styleTextInput={commonStyle.fontAddress}
                value={address}
                onFocus={this.onFocusAddress}
                onBlur={this.onBlurTextField}
              />
              {errorAddress !== '' &&
                <Text style={styles.errorText}>{errorAddress}</Text>
              }
              <ActionButton
                style={{ height: 40, marginTop: 25 }}
                buttonItem={{
                  name: constant.SCAN_QR_CODE,
                  icon: images.iconQrCode,
                  background: '#121734'
                }}
                styleText={{ color: AppStyle.backgroundColor }}
                styleIcon={{ tintColor: AppStyle.backgroundColor }}
                action={this.gotoScan}
              />
            </KeyboardView>
            <BottomButton
              onPress={this.handleCreate}
              disable={!isReadyCreate}
            />
            {loading &&
              <Spinner />
            }
          </View>
        </TouchOutSideDismissKeyboard>
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center'
  },
  titleText: {
    fontSize: 16,
    fontFamily: 'OpenSans-Semibold',
    color: 'white',
    alignSelf: 'flex-start',
    marginLeft: 20
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'OpenSans-Semibold',
    color: AppStyle.errorColor,
    alignSelf: 'flex-start',
    marginTop: 10,
    marginLeft: 20
  }
})
