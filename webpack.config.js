const path = require('path');
module.exports = {
    entry: {
        main: './src/main.ts',
        Game: './src/Game.ts',
        Enemy: './src/Enemy.ts',
        Room: './src/Room.ts',
        ICollisionRect: './src/ICollisionRect.ts',
        Bullet: './src/Bullet.ts',
        EnemyBullet: './src/EnemyBullet.ts'
    },
    output: {
        path: path.resolve(__dirname, '.'),
        filename: '[name].js'
    },
    module: {
        rules: [
          {
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/
          }
        ]
      },
      resolve: {
        extensions: [ '.tsx', '.ts', '.js' ]
      },
    watch: true
};