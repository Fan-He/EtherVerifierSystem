<template>
    <div class="board-view">
        <table class="board-table">
            <thead>
                <tr>
                    <th class="wide-column">Address</th>
                    <th class="thin-column">Status</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="user in users" :key="user.id">
                    <td class="wide-column">{{ user.walletAddress }}</td>
                    <td class="thin-column">
                        <div class="status-box">
                            <div class="circle" :class="{'green': status.find(s => s.id === user.id).status === 'High', 'yellow': status.find(s => s.id === user.id).status === 'Medium', 'red': status.find(s => s.id === user.id).status === 'Low'}" style="float: left;"></div>
                            <p style="display: inline-block; float: left;">{{ status.find(s => s.id === user.id).status }}</p>
                            <div class="circle-container"></div>
                        </div>
                        
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
export default {
    data() {
        return {
            users: [
                { id: 1, walletAddress: '0x1234567890' },
                { id: 2, walletAddress: '0xabcdef1234' },
                { id: 3, walletAddress: '0x9876543210' },
                // Add more users as needed
            ], 
            status: [
                { id: 1, status: 'High' },
                { id: 2, status: 'Medium' },
                { id: 3, status: 'Low' },
            ]
        };
    }
};
</script>

<style>
.board-view {
    display: flex;
    justify-content: center;
}

.board-table {
    border-collapse: collapse;
    width: 100%;
}

.board-table th,
.board-table td {
    border: 1px solid black;
    padding: 8px;
    text-align: center;
}

.wide-column {
    width: 70%;
}

.thin-column {
    width: 30%;
}
.circle {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: inline-block;
    margin: 10px; /* Add this line to reduce the margin between the circle and the text */
}
.green {
        background-color: green;
}

.yellow {
        background-color: darkorange;
}

.red {
        background-color: red;
}

.status-box {
    display: flex;
    align-items: center;
    align-self: center;
}

</style>