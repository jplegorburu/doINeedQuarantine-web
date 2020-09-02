import Head from 'next/head'
import styles from '../styles/Home.module.css'

export default function Home(props) {

  const datediff = function(first, second){
    // Take the difference between the dates and divide by milliseconds per day.
    // Round to nearest whole number to deal with DST.
    return Math.round((second-first)/(1000*60*60*24));
  }

  const getAveragefromLast2Weeks = (data, population, daysFromToday) => {
    var day;
    if(daysFromToday){
      day = new Date();
      day.setDate(day.getDate() - daysFromToday)
    } else{
      day = Date.now();
    }
    var last2Weeks = data.filter(d => datediff(Date.parse(d.date), day) <=14).map(d => d.new_cases);
    var totalNewCases = last2Weeks.reduce((a,b)=>{ return a + b}, 0);
    return (totalNewCases/population*100000).toFixed(2);
  }

  const getTableData = (data) => {
    return Object.keys(data).map(country => {
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
        change: (getAveragefromLast2Weeks(props[country].data, props[country].population,1) - getAveragefromLast2Weeks(props[country].data, props[country].population)).toFixed(2),
      }
    }).sort(function(a, b) {
      var nameA = a.continent.toUpperCase(); // ignore upper and lowercase
      var nameB = b.continent.toUpperCase(); // ignore upper and lowercase
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
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
        <h1 className={styles.title}>
          Do I need to do Quarantine?
        </h1>

        <div>
            <table>
            <tr>
              <th>Continent</th>
              <th>Country</th>
              <th>Average last 14 days</th>
              <th>Change</th>
            </tr>
            { props && getTableData(props).map( r => {
              return(
                <tr className={r.average > 16 ? 'red': 'green'}>
                  <th>{r.continent}</th>
                  <th>{r.country}</th>
                  <th>{r.average}</th>
                  <th>{r.change}</th>
                </tr>
                )
              })
            }
            </table>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <img src="/vercel.svg" alt="Vercel Logo" className={styles.logo} />
        </a>
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
    props: data
  }
}