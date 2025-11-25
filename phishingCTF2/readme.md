challege part 1
    get flag console js

    const canvas = document.getElementById('stego-canvas');
    const ctx = canvas. getContext('2d');
    let flag = '';
    for (let i = 0; i < 20; i++) {
        const x = 50 + (i * 6);
        const pixel = ctx.getImageData(x, 295, 1, 1).data;
        flag += String.fromCharCode(pixel[0]);
    }
    console.log('Flag Part 1:', flag);


challeng part 2 

        INTERNAL DEV NOTE - REMOVE BEFORE PRODUCTION:
        Traffic Analysis Protocol v3.7
        ========================================
        Layer Sequence: [ROT-n] → [BASE-x] → [XOR-k]
        Where: n = baker's dozen, x = 2^5, k = 0x2A
        Fragment reconstruction: Chronological order (PKT sequence)
        WARNING: Decoy packet in stream (check domain mismatch)

