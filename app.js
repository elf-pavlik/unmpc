$(function(){
  axios.get('https://wwelves.org/perpetual-tripper/')
  .then(function(response) {
    console.log(response.data);
  });

  console.log('READY!');
});
