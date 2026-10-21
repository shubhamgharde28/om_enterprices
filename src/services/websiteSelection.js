const WEBSITE_SELECTION_KEY = 'om-enterprises-website-selection'

export const getWebsiteSelection = () => localStorage.getItem(WEBSITE_SELECTION_KEY)

export const saveWebsiteSelection = (selection) => {
  if (!['water', 'solar'].includes(selection)) {
    throw new Error('Choose either Water Purifier or Solar Services.')
  }

  localStorage.setItem(WEBSITE_SELECTION_KEY, selection)
}
