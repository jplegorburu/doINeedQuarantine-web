import Head from 'next/head'
import styles from '../styles/Home.module.css'
import React, { useState, useEffect } from 'react';

export default function Home(props) {

  const [highlated, setHighlated] = useState(-1);
  const [ average, setAverage ] = useState(16)
  const [ filterCont, setFilterCont ] = useState('World')
  const [ habitants, setHabitants ] = useState(100000)
  const [ today, setToday ] = useState(formatDate(Date.now()))
  const [ sortParam, setSortParam ] = useState('continent')
  const [ sortOrder, setSortOrder ] = useState(1)

  const changeSortOrder = (_) => {(sortOrder===1? setSortOrder(-1): setSortOrder(1))}

  function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

  const datediff = function(first, second){
    // Take the difference between the dates and divide by milliseconds per day.
    // Round to nearest whole number to deal with DST.
    return Math.round((second-first)/(1000*60*60*24));
  }

  const highlightRow = high => evt => {
    setHighlated(high);
}

  const getAveragefromLast2Weeks = (data, population, daysFromToday) => {
    var day = new Date(today);
    if(daysFromToday){
      day.setDate(day.getDate() - daysFromToday)
    }
    var last2Weeks = data.filter(d => datediff(Date.parse(d.date), day) <= 14 && datediff(Date.parse(d.date), day) > 0).map(d => d.new_cases);
    var totalNewCases = last2Weeks.reduce((a,b)=>{ return a + b}, 0);
    return (totalNewCases/population*habitants).toFixed(2);
  }

  const getContinets = (data) => {
    var continents = [];
    new Set(Object.keys(data).map(c => data[c].continent)).forEach(a => continents.push(a))
    return continents
  }

  const getNewCases = (data, daysFromToday) => {
    var day = new Date(today);
    if(daysFromToday){
      day.setDate(day.getDate() - daysFromToday)
    }
    var casesForToday = data.filter(d => d.date === formatDate(day))[0];
    return casesForToday? casesForToday.new_cases:0
  }

  const getTableData = (data, continent) => {
    var countries = Object.keys(data)
    if(continent != "World"){
      countries = countries.filter(c => data[c].continent === continent);
    }
    return countries.map(country => {
      var continent;
      if(data[country].continent){
        continent = data[country].continent;
      }
      else{
        continent = "World";
      }      
      return {
        continent: continent,
        country: data[country].location,
        average: getAveragefromLast2Weeks(props[country].data, props[country].population),
        change: (getAveragefromLast2Weeks(props[country].data, props[country].population) - getAveragefromLast2Weeks(props[country].data, props[country].population, 1)).toFixed(2),
        newCases: getNewCases(props[country].data),
        newCasesYesterday: getNewCases(props[country].data, 1),
      }
    }).sort(function(a, b) {
      var nameA = a[sortParam].toString().toUpperCase(); // ignore upper and lowercase
      var nameB = b[sortParam].toString().toUpperCase(); // ignore upper and lowercase
      if(parseFloat(nameA)|| parseFloat(nameB)){
        nameA = parseFloat(nameA);
        nameB = parseFloat(nameB);
      }
      if (nameA < nameB) {
        return -sortOrder;
      }
      if (nameA > nameB) {
        return sortOrder;
      }
      // names must be equal
      return 0;
    });
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Do I need Quarantine</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <img src="/larger_icon.png" alt="Logo" className={styles.logo} />
        <h1 className={styles.title}>Do I need to do quarantine?
        </h1>
        <p>
          Most of the countries have a restriction to travel according to the avarage of new cases every certain number of people.<br/><br/>
          Generally the rate when you would need to do quarantine if you arrive from a country is when there are 16 new cases every 100.000 persons. <br/><br/>
          All this data is taken from <a className={styles.linkToPage} href="https://ourworldindata.org/coronavirus" target="_blank" rel="noopener noreferrer">Our World in Data</a><br/>
        </p>
        <div>
            <table  className="filterTable">
                <tr>
                  <th align="left" ><label htmlFor='average'>Average cases</label></th>
                  <th align="left" ><label htmlFor='filterCont'>Continent</label></th>
                  <th align="left" ><label htmlFor='habitants'>Cases every:</label></th>
                </tr>
                <tr>
                  <th align="left" >
                    <input id="average" type="text" placeholder="average" value={average} onChange={ evt => setAverage(evt.target.value)}/>
                  </th>
                  <th align="left" >
                    <select name="filterCont" id="filterCont" value={filterCont} onChange={ evt => setFilterCont(evt.target.value)}>
                    { props && getContinets(props).map( r => {
                          return(<option value={r}>{r?r:"World" }</option>)
                        })
                    }
                    </select>
                  </th>
                  <th align="left" >
                    <select name="habitants" id="habitants" value={habitants} onChange={ evt => setHabitants(evt.target.value)}>
                      { new Array(4).fill().map( (_, i) => {
                            return(<option value={Math.pow(10, i+4)}>{Math.pow(10, i+4)}</option>)
                          })
                      }
                    </select>
                  </th>
                </tr>
            </table>
            <table className="dataTable">
            <tr>
              <th onDoubleClick={changeSortOrder} onClick={ evt => setSortParam('continent')}>Continent</th>
              <th onDoubleClick={changeSortOrder} onClick={ evt => setSortParam('country')}>Country</th>
              <th onDoubleClick={changeSortOrder} onClick={ evt => setSortParam('average')}>Average <br />last 14 days</th>
              <th onDoubleClick={changeSortOrder} onClick={ evt => setSortParam('change')}>Change</th>
              <th onDoubleClick={changeSortOrder} onClick={ evt => setSortParam('newCases')}>New Cases <br />({today})</th>
              <th onDoubleClick={changeSortOrder} onClick={ evt => setSortParam('newCasesYesterday')}>New Cases <br />(Yesterday)</th>
            </tr>
            { props && getTableData(props, filterCont).map( (r,i) => {
              return(
                <tr className={parseFloat(r.average) >= parseFloat(average) ? (highlated===i? 'red-highlated': 'red'): (highlated===i? 'green-highlated': 'green')} onMouseEnter={highlightRow(i)} onMouseLeave={highlightRow(-1)}>
                  <th>{r.continent}</th>
                  <th>{r.country}</th>
                  <th>{r.average}</th>
                  <th>{r.change}</th>
                  <th>{r.newCases}</th>
                  <th>{r.newCasesYesterday}</th>
                </tr>
                )
              })
            }
            </table>
        </div>
      </main>

      <footer className={styles.footer}>
        <p className={styles.logo}>
          Powered by {'Sir Chompoldus'}
        </p>
      </footer>
    </div>
  )
}

export async function getStaticProps() {
  // Get external data from the file system, API, DB, etc.
  const response = await fetch("https://covid.ourworldindata.org/data/owid-covid-data.json", {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
        })
  const data = await response.json()
  // The value of the `props` key will be
  //  passed to the `Home` component
  return {
    props: data,
    revalidate: 10
  }
}
