module.exports = (time) => {
	const [date, month, year] = new Date(time).toLocaleDateString("uz-UZ").split("/")
	const [hour, minute] = new Date(time).toLocaleTimeString("uz-UZ").split(/:| /)

	return `${year}/${month}/${date} | ${hour}:${minute}`
}