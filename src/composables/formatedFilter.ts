export const formatFilter = (filterArray: any) => {

    const formattedFilters = []
    for (let i = 0; i < filterArray.length; i++) {
      if (filterArray[i] === '=' ) continue
      if(filterArray[i] === 'or') {
        formattedFilters.push({ fieldName : 'or', value:undefined })
        continue
      }
      if(Array.isArray(filterArray[i][0]) && filterArray[i].length > 2) {
       
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
    
        formattedFilters.push({ fieldName : '!', value:undefined })
        if(Array.isArray(filterArray[i][1][0])){
          const formatted: any[] = formatFilter(filterArray[i][1])
          for (let format of formatted) {
            formattedFilters.push(format)
          }
          continue
        }
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
  