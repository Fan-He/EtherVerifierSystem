<style>
.home-view {
  display: flex;
  flex-direction: column;
  height: 80vh;
  margin-top: 20px;
  margin-bottom: 20px;
}

.upper-square,
.lower-square {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 70%;
}

.square-content {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 200px; /* Updated width to 100px */
  height: 200px; /* Updated height to 100px */
  background-color: lightblue;
  border-radius: 50%;
}

.square-link {
  text-decoration: none;
  color: whitesmoke;
  font-size: 35px;
}


</style>
<template>
  <div class="home-view">
    <div class="upper-square">
      <div class="square-content">
        <a href="#" class="square-link">Verifier</a>
      </div>
    </div>
    <div class="lower-square">
      <div class="square-content">
        <a href="#" class="square-link">Provider</a>
      </div>
    </div>
  </div>
</template>
