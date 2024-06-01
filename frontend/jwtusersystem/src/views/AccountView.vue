<template>
    <div class="account-view">
        <!-- <div class="photo">
            <img :src="require('@/views/user.png')" alt="User Photo" >
        </div> -->
        <div class="info">
            <h2>{{ user.name }}</h2>
            <p>{{ user.address }}</p>
            <p>Balance: {{ user.balance }}</p>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            user: {
                photo: "require('@/views/user.png')",
                name: "Test User",
                address: "123 Main St, Anytown, Canada",
                balance: "$1000"
            }
        };
    }
};
</script>

<style scoped>
.account-view {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
}

.photo img {
    width: 200px;
    height: 200px;
    border-radius: 50%;
    object-fit: cover;
}

.info {
    margin-top: 20px;
    text-align: center;
}

@media (max-width: 768px) {
    .photo img {
        width: 150px;
        height: 150px;
    }
}
</style>