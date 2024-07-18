export const formatFilter = (filterArray: any) => {
    const formattedFilters = []
    for (let i = 0; i < filterArray.length; i++) {
      if (filterArray[i] === '=' ||filterArray[i] === 'or') continue
      if(filterArray[i] === 'or') {
        formattedFilters.push({ fieldName : 'or', value:undefined })
        continue
      }
      if(Array.isArray(filterArray[i][0]) && filterArray[i].length > 2) {
        console.log('passei aqq 2', filterArray[i])
          for(let j = 0; j < filterArray[i].length; j++){
              if(filterArray[i][j] === 'or') {
                  formattedFilters.push({ fieldName : 'or', value:undefined })
                  continue
              }
              const fieldName = Array.isArray(filterArray[i][j]) ? filterArray[i][j][0] : filterArray[i][j]
              const value = Array.isArray(filterArray[i][j]) ? filterArray[i][j]['filterValue'] : filterArray['filterValue']
              formattedFilters.push({ fieldName, value })
          }
          continue
      }
      if (filterArray[i] === filterArray['filterValue']) continue
  
      if( filterArray[i][0] == '!' && filterArray[i][1]?.length > 0) {
        console.log('passei aqq 1', filterArray[i])
        formattedFilters.push({ fieldName : '!', value:undefined })
        const fieldName = Array.isArray(filterArray[i][1]) ? filterArray[i][1][0] : filterArray[i]
        const value = Array.isArray(filterArray[i][1]) ? filterArray[i][1]['filterValue'] : filterArray['filterValue']
        formattedFilters.push({ fieldName, value })
        continue
        
      }
  
      const fieldName = Array.isArray(filterArray[i]) ? filterArray[i][0] : filterArray[i]
      const value = Array.isArray(filterArray[i]) ? filterArray[i]['filterValue'] : filterArray['filterValue']
  
      formattedFilters.push({ fieldName, value })
    }
  
    return formattedFilters
  }
  