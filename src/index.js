import 'alpinejs'
import '@leanix/reporting'
import './assets/tailwind.css'

const  state = {
  factSheetType: 'Application',
  viewKey: null,
  viewCallbackLegendItems: [],
  graphQLLegendItems: []
}

const methods = {
  async initializeReport () {
    const { factSheetType } = this
    await lx.init()

    const config = {
      facets: [
        {
          key: 1,
          fixedFactSheetType: factSheetType
        }
      ],
      reportViewFactSheetType: factSheetType,
      reportViewCallback: ({ legendItems, key }) => {
        this.viewKey = key
        this.viewCallbackLegendItems = legendItems
      }
    }

    await lx.ready(config)
  },
  getComputedItemStyle (item) {
    const { bgColor, color } = item
    return `background: ${bgColor}; color: ${color}`
  },
  async fetchGraphQLLegendItems () {
    const { factSheetType, viewKey: key } = this
    const query = `
      query ($factSheetType: FactSheetType, $key: String, $filter: FilterInput) {
        view(factSheetType: $factSheetType, key: $key, filter: $filter) {
          legendItems { id bgColor color value inLegend transparency }
        }
      }
    `
    const variables = { factSheetType, key, filter: {} }

    this.graphQLLegendItems = await lx.executeGraphQL(query, variables)
      .then(({ view }) => view.legendItems
        .map(item => {
          const { value } = item
          return { ...item, label: lx.translateFieldValue(factSheetType, key, value) }
        }))
  }
}

window.initializeContext = () => {
  return {
    ...state,
    ...methods
  }
}