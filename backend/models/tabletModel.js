module.exports = (sequelize, DataTypes) => {
    const Tablet =  sequelize.define("Tablet", {
        
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        height: {
            type: DataTypes.DOUBLE,
            allowNull: false,
        },
        width: {
            type: DataTypes.DOUBLE,
            allowNull: false,
        },
        annotations: {
            type: DataTypes.JSON,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM("pending", "finished"),
            allowNull: false
        },
        path: {
            type: DataTypes.STRING,
            allowNull: false
        },
    });
    
    Tablet.associate = models => {
        Tablet.belongsToMany(models.User, {through: "usertablet", timestamps: false},);
    };
    
    return Tablet;
};