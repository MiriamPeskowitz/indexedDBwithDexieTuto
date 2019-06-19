import React, { useCallback, useEffect, useState } from 'react';
import { Offline, Online } from 'react-detect-offline';
//npm install react-detect-offline -- hides the submit until the client is back online 


const formStyle = { padding: '2rem 0rem'}
const inputStyle = { margin: '1rem 0rem'}

const Form = ({ db }) => {
 const [ names, setNames ] = useState({ firstname: '', lastname: '' })

 // set firstname and lastname to whatever is in the database
  // if no values are in the database, set the database values to ''
  useEffect(
    () => {
      //create store
      db.version(1).stores({ formData: 'id,value'})
       //read/write tx on the new store 
      db.transaction('rw', db.formData, async() => {
        const dbFirstname = await db.formData.get('firstname')
        const dbLastname = await db.formData.get('lastname')

        if (!dbFirstname) await db.formData.add({ id: 'firstname', value: ''})
        if (!dbLastname) await db.formData.add({ id: 'lastname', value: ''})
//set the initial values 
        setNames({
          firstname: dbFirstname ? dbFirstname.value : '',
          lastname: dbLastname ? dbLastname.value : ''
        })
      }).catch(e => {
        console.log(e.stack || e)
      }) 
      //close db
      return () => db.close()
    },
    //run effect when db connection changes 
    [db]
  )
 //set name in the store and in the store hook
 const setName = useCallback(
  id => value => {
    //update the store 
    db.formData.put({ id, value })
//update the state hook
    setNames(prevNames => ({ ...prevNames, [id]:value }))
  },
  [db]
  )
  // partial application to make on change handler easier to deal with
const handleSetName = useCallback(id => e => setName(id)(e.target.value), [
  db
  ])

  //reset the data in the store and in the state hook
  const handleSubmit = useCallback(
  e => {
    e.preventDefault()
    setName('firstname')('')
    setName('lastname')('')
  },
  [db]
)

  return (
    <form style={formStyle} onSubmit={handleSubmit} >
    <span> First name </span>
    <br />
    <input
      style={inputStyle}
      type="text"
      name="firstname"
      value={names.firstname}
      onChange={handleSetName('firstname')}
      />
      <br />
      <span>Last name:</span>
      <br />
      <input 
        style={inputStyle}
        type="text"
        name="lastname"
        value={names.lastname}
        onChange={handleSetName('lastname')}
        />
        <br/>
        <Online>
          <input type="submit" value="Submit" />
        </Online>
        <Offline>You are currenlty offline!</Offline>
       </form> 
    )
}
export default Form; 
//controlled form made with React Hooks 
